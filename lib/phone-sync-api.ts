// Phone-Synced SMS System
// Uses connected phones to send SMS without paid services
// Supports multiple phones with automatic rotation

interface ConnectedPhone {
  id: string
  name: string
  phoneNumber: string
  deviceId: string
  apiKey?: string // For Pushbullet or similar
  status: "online" | "offline" | "busy"
  messagesSent: number
  lastUsed: Date
  type: "pushbullet" | "sms-gateway" | "kde-connect"
}

interface PhoneSyncMessage {
  to: string
  message: string
  phoneId?: string // Optional: specify which phone to use
}

// Storage key for connected phones
const PHONES_STORAGE_KEY = "page_crm_connected_phones"

// Get all connected phones from localStorage
export function getConnectedPhones(): ConnectedPhone[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(PHONES_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// Save connected phones to localStorage
export function saveConnectedPhones(phones: ConnectedPhone[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PHONES_STORAGE_KEY, JSON.stringify(phones))
}

// Add a new phone connection
export function addPhone(phone: Omit<ConnectedPhone, "id" | "messagesSent" | "lastUsed">): ConnectedPhone {
  const phones = getConnectedPhones()
  const newPhone: ConnectedPhone = {
    ...phone,
    id: Date.now().toString(),
    messagesSent: 0,
    lastUsed: new Date(),
  }
  phones.push(newPhone)
  saveConnectedPhones(phones)
  console.log("[v0] Phone added:", newPhone.name, newPhone.phoneNumber)
  return newPhone
}

// Remove a phone connection
export function removePhone(phoneId: string): void {
  const phones = getConnectedPhones().filter((p) => p.id !== phoneId)
  saveConnectedPhones(phones)
  console.log("[v0] Phone removed:", phoneId)
}

// Update phone status
export function updatePhoneStatus(phoneId: string, status: ConnectedPhone["status"]): void {
  const phones = getConnectedPhones()
  const phone = phones.find((p) => p.id === phoneId)
  if (phone) {
    phone.status = status
    saveConnectedPhones(phones)
    console.log("[v0] Phone status updated:", phoneId, status)
  }
}

// Get next available phone (round-robin rotation)
export function getNextAvailablePhone(): ConnectedPhone | null {
  const phones = getConnectedPhones().filter((p) => p.status === "online")
  if (phones.length === 0) return null

  // Sort by least recently used
  phones.sort((a, b) => new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime())
  return phones[0]
}

// Send SMS via Pushbullet
async function sendViaPushbullet(phone: ConnectedPhone, to: string, message: string): Promise<boolean> {
  try {
    if (!phone.apiKey) {
      console.error("[v0] Pushbullet API key not set for phone:", phone.name)
      return false
    }

    const response = await fetch("https://api.pushbullet.com/v2/texts", {
      method: "POST",
      headers: {
        "Access-Token": phone.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          addresses: [to],
          message: message,
          target_device_iden: phone.deviceId,
        },
      }),
    })

    if (response.ok) {
      console.log("[v0] SMS sent via Pushbullet from", phone.phoneNumber, "to", to)
      return true
    } else {
      const error = await response.text()
      console.error("[v0] Pushbullet error:", error)
      return false
    }
  } catch (error) {
    console.error("[v0] Pushbullet send error:", error)
    return false
  }
}

// Send SMS via SMS Gateway API (Android app)
async function sendViaSMSGateway(phone: ConnectedPhone, to: string, message: string): Promise<boolean> {
  try {
    // SMS Gateway API runs on the phone itself
    // Default port is 8080, but user can configure
    const gatewayUrl = `http://${phone.deviceId}:8080/send-sms`

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: to,
        message: message,
      }),
    })

    if (response.ok) {
      console.log("[v0] SMS sent via SMS Gateway from", phone.phoneNumber, "to", to)
      return true
    } else {
      console.error("[v0] SMS Gateway error:", await response.text())
      return false
    }
  } catch (error) {
    console.error("[v0] SMS Gateway send error:", error)
    return false
  }
}

// Send SMS via KDE Connect
async function sendViaKDEConnect(phone: ConnectedPhone, to: string, message: string): Promise<boolean> {
  try {
    // KDE Connect API endpoint (requires KDE Connect running on desktop)
    const kdeUrl = `http://localhost:1716/sendSMS`

    const response = await fetch(kdeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: phone.deviceId,
        phoneNumber: to,
        messageBody: message,
      }),
    })

    if (response.ok) {
      console.log("[v0] SMS sent via KDE Connect from", phone.phoneNumber, "to", to)
      return true
    } else {
      console.error("[v0] KDE Connect error:", await response.text())
      return false
    }
  } catch (error) {
    console.error("[v0] KDE Connect send error:", error)
    return false
  }
}

// Main send function with phone rotation
export async function sendSMSViaPhone(payload: PhoneSyncMessage): Promise<{
  success: boolean
  phoneUsed?: ConnectedPhone
  error?: string
}> {
  console.log("[v0] Sending SMS via phone sync to", payload.to)

  // Get phone to use (specified or next available)
  let phone: ConnectedPhone | null = null

  if (payload.phoneId) {
    phone = getConnectedPhones().find((p) => p.id === payload.phoneId && p.status === "online") || null
  } else {
    phone = getNextAvailablePhone()
  }

  if (!phone) {
    return {
      success: false,
      error: "No phones available. Please connect a phone first.",
    }
  }

  // Mark phone as busy
  updatePhoneStatus(phone.id, "busy")

  let success = false

  // Send via appropriate method
  switch (phone.type) {
    case "pushbullet":
      success = await sendViaPushbullet(phone, payload.to, payload.message)
      break
    case "sms-gateway":
      success = await sendViaSMSGateway(phone, payload.to, payload.message)
      break
    case "kde-connect":
      success = await sendViaKDEConnect(phone, payload.to, payload.message)
      break
  }

  // Update phone stats
  if (success) {
    const phones = getConnectedPhones()
    const updatedPhone = phones.find((p) => p.id === phone!.id)
    if (updatedPhone) {
      updatedPhone.messagesSent++
      updatedPhone.lastUsed = new Date()
      updatedPhone.status = "online"
      saveConnectedPhones(phones)
    }
  } else {
    updatePhoneStatus(phone.id, "online")
  }

  return {
    success,
    phoneUsed: phone,
    error: success ? undefined : "Failed to send SMS",
  }
}

// Bulk send with automatic phone rotation
export async function sendBulkSMSViaPhones(
  recipients: string[],
  message: string,
): Promise<{
  success: number
  failed: number
  results: Array<{ to: string; success: boolean; phoneUsed?: string }>
}> {
  const results: Array<{ to: string; success: boolean; phoneUsed?: string }> = []
  let successCount = 0
  let failedCount = 0

  for (const recipient of recipients) {
    const result = await sendSMSViaPhone({
      to: recipient,
      message,
    })

    results.push({
      to: recipient,
      success: result.success,
      phoneUsed: result.phoneUsed?.phoneNumber,
    })

    if (result.success) {
      successCount++
    } else {
      failedCount++
    }

    // Small delay between messages to avoid overwhelming phones
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log("[v0] Bulk SMS complete:", successCount, "success,", failedCount, "failed")

  return {
    success: successCount,
    failed: failedCount,
    results,
  }
}

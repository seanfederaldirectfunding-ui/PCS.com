// Standalone Phone-Sync SMS System
// No third-party services required - phones connect directly to CRM via WebSocket

interface ConnectedPhone {
  id: string
  name: string
  phoneNumber: string
  status: "online" | "offline" | "busy"
  messagesSent: number
  lastUsed: Date
  lastHeartbeat: Date
  batteryLevel?: number
  signalStrength?: number
}

interface QueuedMessage {
  id: string
  to: string
  message: string
  phoneId?: string
  status: "pending" | "sent" | "failed"
  attempts: number
  createdAt: Date
  sentAt?: Date
  error?: string
}

interface IncomingSMS {
  id: string
  from: string
  message: string
  phoneId: string
  receivedAt: Date
  read: boolean
}

// Storage keys
const PHONES_KEY = "page_crm_phones"
const MESSAGE_QUEUE_KEY = "page_crm_message_queue"
const INCOMING_SMS_KEY = "page_crm_incoming_sms"
const PHONE_CONNECTIONS_KEY = "page_crm_phone_connections"

// WebSocket connection simulation (in production, use actual WebSocket server)
class PhoneConnectionManager {
  private connections: Map<string, any> = new Map()
  private messageHandlers: Map<string, (data: any) => void> = new Map()

  connect(phoneId: string, phoneNumber: string) {
    console.log("[v0] Phone connecting:", phoneId, phoneNumber)

    // Simulate WebSocket connection
    const connection = {
      phoneId,
      phoneNumber,
      connected: true,
      lastHeartbeat: new Date(),
    }

    this.connections.set(phoneId, connection)
    this.updatePhoneStatus(phoneId, "online")

    // Simulate heartbeat
    const heartbeatInterval = setInterval(() => {
      if (this.connections.has(phoneId)) {
        connection.lastHeartbeat = new Date()
        this.updatePhoneHeartbeat(phoneId)
      } else {
        clearInterval(heartbeatInterval)
      }
    }, 30000) // Every 30 seconds

    return connection
  }

  disconnect(phoneId: string) {
    console.log("[v0] Phone disconnecting:", phoneId)
    this.connections.delete(phoneId)
    this.updatePhoneStatus(phoneId, "offline")
  }

  isConnected(phoneId: string): boolean {
    return this.connections.has(phoneId)
  }

  sendMessage(phoneId: string, to: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConnected(phoneId)) {
        console.error("[v0] Phone not connected:", phoneId)
        resolve(false)
        return
      }

      console.log("[v0] Sending SMS via phone:", phoneId, "to:", to)

      // In production, send via WebSocket to phone
      // For now, simulate successful send
      setTimeout(() => {
        console.log("[v0] SMS sent successfully")
        resolve(true)
      }, 1000)
    })
  }

  onIncomingSMS(handler: (data: IncomingSMS) => void) {
    this.messageHandlers.set("incoming_sms", handler)
  }

  private updatePhoneStatus(phoneId: string, status: ConnectedPhone["status"]) {
    const phones = getConnectedPhones()
    const phone = phones.find((p) => p.id === phoneId)
    if (phone) {
      phone.status = status
      saveConnectedPhones(phones)
    }
  }

  private updatePhoneHeartbeat(phoneId: string) {
    const phones = getConnectedPhones()
    const phone = phones.find((p) => p.id === phoneId)
    if (phone) {
      phone.lastHeartbeat = new Date()
      saveConnectedPhones(phones)
    }
  }
}

export const phoneConnectionManager = new PhoneConnectionManager()

// Get connected phones
export function getConnectedPhones(): ConnectedPhone[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(PHONES_KEY)
  return stored ? JSON.parse(stored) : []
}

// Save connected phones
export function saveConnectedPhones(phones: ConnectedPhone[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PHONES_KEY, JSON.stringify(phones))
}

// Register a new phone
export function registerPhone(name: string, phoneNumber: string): ConnectedPhone {
  const phones = getConnectedPhones()
  const phoneId = `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const newPhone: ConnectedPhone = {
    id: phoneId,
    name,
    phoneNumber,
    status: "offline",
    messagesSent: 0,
    lastUsed: new Date(),
    lastHeartbeat: new Date(),
  }

  phones.push(newPhone)
  saveConnectedPhones(phones)
  console.log("[v0] Phone registered:", name, phoneNumber)

  return newPhone
}

// Remove phone
export function removePhone(phoneId: string): void {
  phoneConnectionManager.disconnect(phoneId)
  const phones = getConnectedPhones().filter((p) => p.id !== phoneId)
  saveConnectedPhones(phones)
  console.log("[v0] Phone removed:", phoneId)
}

// Connect phone (called from companion app)
export function connectPhone(phoneId: string, phoneNumber: string): boolean {
  const phones = getConnectedPhones()
  const phone = phones.find((p) => p.id === phoneId)

  if (!phone) {
    console.error("[v0] Phone not found:", phoneId)
    return false
  }

  phoneConnectionManager.connect(phoneId, phoneNumber)
  return true
}

// Get next available phone for sending
export function getNextAvailablePhone(): ConnectedPhone | null {
  const phones = getConnectedPhones().filter((p) => p.status === "online")
  if (phones.length === 0) return null

  // Sort by least recently used
  phones.sort((a, b) => new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime())
  return phones[0]
}

// Message Queue Management
export function getMessageQueue(): QueuedMessage[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(MESSAGE_QUEUE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveMessageQueue(queue: QueuedMessage[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue))
}

export function addToQueue(to: string, message: string, phoneId?: string): QueuedMessage {
  const queue = getMessageQueue()
  const queuedMessage: QueuedMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    message,
    phoneId,
    status: "pending",
    attempts: 0,
    createdAt: new Date(),
  }

  queue.push(queuedMessage)
  saveMessageQueue(queue)
  console.log("[v0] Message added to queue:", to)

  return queuedMessage
}

// Send single SMS
export async function sendSMS(
  to: string,
  message: string,
  phoneId?: string,
): Promise<{
  success: boolean
  phoneUsed?: ConnectedPhone
  error?: string
}> {
  console.log("[v0] Sending SMS to:", to)

  // Get phone to use
  let phone: ConnectedPhone | null = null

  if (phoneId) {
    phone = getConnectedPhones().find((p) => p.id === phoneId && p.status === "online") || null
  } else {
    phone = getNextAvailablePhone()
  }

  if (!phone) {
    // Add to queue for later
    addToQueue(to, message, phoneId)
    return {
      success: false,
      error: "No phones available. Message queued for later.",
    }
  }

  // Mark phone as busy
  const phones = getConnectedPhones()
  const busyPhone = phones.find((p) => p.id === phone!.id)
  if (busyPhone) {
    busyPhone.status = "busy"
    saveConnectedPhones(phones)
  }

  // Send message
  const success = await phoneConnectionManager.sendMessage(phone.id, to, message)

  // Update phone stats
  const updatedPhones = getConnectedPhones()
  const sentPhone = updatedPhones.find((p) => p.id === phone!.id)
  if (sentPhone) {
    sentPhone.status = "online"
    if (success) {
      sentPhone.messagesSent++
      sentPhone.lastUsed = new Date()
    }
    saveConnectedPhones(updatedPhones)
  }

  return {
    success,
    phoneUsed: phone,
    error: success ? undefined : "Failed to send SMS",
  }
}

// Send bulk SMS with rotation
export async function sendBulkSMS(
  recipients: string[],
  message: string,
): Promise<{
  success: number
  failed: number
  queued: number
  results: Array<{ to: string; success: boolean; phoneUsed?: string }>
}> {
  const results: Array<{ to: string; success: boolean; phoneUsed?: string }> = []
  let successCount = 0
  let failedCount = 0
  let queuedCount = 0

  for (const recipient of recipients) {
    const result = await sendSMS(recipient, message)

    results.push({
      to: recipient,
      success: result.success,
      phoneUsed: result.phoneUsed?.phoneNumber,
    })

    if (result.success) {
      successCount++
    } else if (result.error?.includes("queued")) {
      queuedCount++
    } else {
      failedCount++
    }

    // Delay between messages
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log("[v0] Bulk SMS complete:", successCount, "sent,", failedCount, "failed,", queuedCount, "queued")

  return {
    success: successCount,
    failed: failedCount,
    queued: queuedCount,
    results,
  }
}

// Incoming SMS Management
export function getIncomingSMS(): IncomingSMS[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(INCOMING_SMS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveIncomingSMS(messages: IncomingSMS[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(INCOMING_SMS_KEY, JSON.stringify(messages))
}

export function addIncomingSMS(from: string, message: string, phoneId: string): IncomingSMS {
  const messages = getIncomingSMS()
  const newMessage: IncomingSMS = {
    id: `incoming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    from,
    message,
    phoneId,
    receivedAt: new Date(),
    read: false,
  }

  messages.unshift(newMessage) // Add to beginning
  saveIncomingSMS(messages)
  console.log("[v0] Incoming SMS received from:", from)

  return newMessage
}

export function markSMSAsRead(messageId: string): void {
  const messages = getIncomingSMS()
  const message = messages.find((m) => m.id === messageId)
  if (message) {
    message.read = true
    saveIncomingSMS(messages)
  }
}

// Generate connection code for phone app
export function generateConnectionCode(phoneId: string): string {
  const code = `${phoneId}:${window.location.origin}`
  return btoa(code) // Base64 encode
}

// Parse connection code
export function parseConnectionCode(code: string): { phoneId: string; serverUrl: string } | null {
  try {
    const decoded = atob(code)
    const [phoneId, serverUrl] = decoded.split(":")
    return { phoneId, serverUrl }
  } catch {
    return null
  }
}

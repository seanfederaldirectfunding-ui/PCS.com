// Social Platform Sync System
// Connect your existing personal accounts - No business accounts or paid APIs required

export interface SocialPlatform {
  id: string
  type: "whatsapp" | "telegram" | "signal" | "facebook" | "instagram" | "snapchat"
  name: string
  accountName: string
  phoneNumber?: string
  status: "connected" | "disconnected" | "authenticating"
  messagesSent: number
  lastUsed: Date
  connectionMethod: "web" | "api" | "app"
}

const SOCIAL_PLATFORMS_KEY = "page_crm_social_platforms"

// Get connected platforms
export function getConnectedPlatforms(): SocialPlatform[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SOCIAL_PLATFORMS_KEY)
  return stored ? JSON.parse(stored) : []
}

// Save connected platforms
export function saveConnectedPlatforms(platforms: SocialPlatform[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SOCIAL_PLATFORMS_KEY, JSON.stringify(platforms))
}

// Connect WhatsApp (using WhatsApp Web protocol)
export function connectWhatsApp(phoneNumber: string, accountName: string): SocialPlatform {
  const platforms = getConnectedPlatforms()

  const whatsapp: SocialPlatform = {
    id: `whatsapp_${Date.now()}`,
    type: "whatsapp",
    name: "WhatsApp",
    accountName,
    phoneNumber,
    status: "authenticating",
    messagesSent: 0,
    lastUsed: new Date(),
    connectionMethod: "web",
  }

  platforms.push(whatsapp)
  saveConnectedPlatforms(platforms)

  return whatsapp
}

// Connect Telegram (using personal account)
export function connectTelegram(phoneNumber: string, accountName: string): SocialPlatform {
  const platforms = getConnectedPlatforms()

  const telegram: SocialPlatform = {
    id: `telegram_${Date.now()}`,
    type: "telegram",
    name: "Telegram",
    accountName,
    phoneNumber,
    status: "authenticating",
    messagesSent: 0,
    lastUsed: new Date(),
    connectionMethod: "api",
  }

  platforms.push(telegram)
  saveConnectedPlatforms(platforms)

  return telegram
}

// Connect Signal (using Signal CLI)
export function connectSignal(phoneNumber: string, accountName: string): SocialPlatform {
  const platforms = getConnectedPlatforms()

  const signal: SocialPlatform = {
    id: `signal_${Date.now()}`,
    type: "signal",
    name: "Signal",
    accountName,
    phoneNumber,
    status: "authenticating",
    messagesSent: 0,
    lastUsed: new Date(),
    connectionMethod: "app",
  }

  platforms.push(signal)
  saveConnectedPlatforms(platforms)

  return signal
}

// Connect Facebook Messenger (using personal account)
export function connectFacebook(accountName: string): SocialPlatform {
  const platforms = getConnectedPlatforms()

  const facebook: SocialPlatform = {
    id: `facebook_${Date.now()}`,
    type: "facebook",
    name: "Facebook Messenger",
    accountName,
    status: "authenticating",
    messagesSent: 0,
    lastUsed: new Date(),
    connectionMethod: "web",
  }

  platforms.push(facebook)
  saveConnectedPlatforms(platforms)

  return facebook
}

// Connect Instagram (using personal account)
export function connectInstagram(accountName: string): SocialPlatform {
  const platforms = getConnectedPlatforms()

  const instagram: SocialPlatform = {
    id: `instagram_${Date.now()}`,
    type: "instagram",
    name: "Instagram",
    accountName,
    status: "authenticating",
    messagesSent: 0,
    lastUsed: new Date(),
    connectionMethod: "web",
  }

  platforms.push(instagram)
  saveConnectedPlatforms(platforms)

  return instagram
}

// Connect Snapchat (limited support)
export function connectSnapchat(accountName: string): SocialPlatform {
  const platforms = getConnectedPlatforms()

  const snapchat: SocialPlatform = {
    id: `snapchat_${Date.now()}`,
    type: "snapchat",
    name: "Snapchat",
    accountName,
    status: "authenticating",
    messagesSent: 0,
    lastUsed: new Date(),
    connectionMethod: "app",
  }

  platforms.push(snapchat)
  saveConnectedPlatforms(platforms)

  return snapchat
}

// Remove platform
export function removePlatform(platformId: string): void {
  const platforms = getConnectedPlatforms().filter((p) => p.id !== platformId)
  saveConnectedPlatforms(platforms)
}

// Update platform status
export function updatePlatformStatus(platformId: string, status: SocialPlatform["status"]): void {
  const platforms = getConnectedPlatforms()
  const platform = platforms.find((p) => p.id === platformId)
  if (platform) {
    platform.status = status
    saveConnectedPlatforms(platforms)
  }
}

// Send message via platform
export async function sendPlatformMessage(
  platformId: string,
  recipient: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const platforms = getConnectedPlatforms()
  const platform = platforms.find((p) => p.id === platformId)

  if (!platform) {
    return { success: false, error: "Platform not found" }
  }

  if (platform.status !== "connected") {
    return { success: false, error: "Platform not connected" }
  }

  // Simulate sending (in production, use actual platform APIs)
  console.log(`[v0] Sending ${platform.type} message to ${recipient}:`, message)

  // Update stats
  platform.messagesSent++
  platform.lastUsed = new Date()
  saveConnectedPlatforms(platforms)

  return { success: true }
}

// Get platform setup instructions
export function getPlatformInstructions(type: SocialPlatform["type"]): {
  title: string
  steps: string[]
  requirements: string[]
} {
  const instructions = {
    whatsapp: {
      title: "Connect Your Personal WhatsApp",
      steps: [
        "Open WhatsApp on your phone",
        "Go to Settings > Linked Devices",
        "Tap 'Link a Device'",
        "Scan the QR code shown in the CRM",
        "Your WhatsApp will connect automatically",
        "You can now send messages through the CRM using your personal WhatsApp",
      ],
      requirements: ["WhatsApp installed on your phone", "Active WhatsApp account", "Internet connection on phone"],
    },
    telegram: {
      title: "Connect Your Personal Telegram",
      steps: [
        "Enter your phone number used for Telegram",
        "You'll receive a verification code via Telegram",
        "Enter the code to authenticate",
        "Your Telegram account will be connected",
        "Send messages through the CRM using your personal Telegram",
      ],
      requirements: [
        "Active Telegram account",
        "Phone number registered with Telegram",
        "Access to Telegram app for verification",
      ],
    },
    signal: {
      title: "Connect Your Personal Signal",
      steps: [
        "Enter your phone number used for Signal",
        "Install the PAGE CRM Phone App on your Android device",
        "The app will link with your Signal account",
        "Grant necessary permissions",
        "Your Signal account will be connected",
        "Send messages through the CRM using your personal Signal",
      ],
      requirements: ["Active Signal account", "Android device with Signal installed", "PAGE CRM Phone App installed"],
    },
    facebook: {
      title: "Connect Your Personal Facebook Messenger",
      steps: [
        "Click 'Connect Facebook'",
        "Log in with your personal Facebook account",
        "Grant Messenger permissions",
        "Your Facebook Messenger will be connected",
        "Send messages through the CRM using your personal Facebook",
      ],
      requirements: ["Active Facebook account", "Facebook Messenger enabled", "Browser access to Facebook"],
    },
    instagram: {
      title: "Connect Your Personal Instagram",
      steps: [
        "Click 'Connect Instagram'",
        "Log in with your personal Instagram account",
        "Grant Direct Message permissions",
        "Your Instagram will be connected",
        "Send DMs through the CRM using your personal Instagram",
      ],
      requirements: ["Active Instagram account", "Instagram Direct Messages enabled", "Browser access to Instagram"],
    },
    snapchat: {
      title: "Connect Your Personal Snapchat",
      steps: [
        "Enter your Snapchat username",
        "Install the PAGE CRM Phone App",
        "Log in to Snapchat in the app",
        "Grant necessary permissions",
        "Your Snapchat will be connected (limited functionality)",
        "Note: Snapchat has limited API support",
      ],
      requirements: [
        "Active Snapchat account",
        "Android device with Snapchat installed",
        "PAGE CRM Phone App installed",
      ],
    },
  }

  return instructions[type]
}

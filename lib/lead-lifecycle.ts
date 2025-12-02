export type LeadStatus = "new" | "contacted" | "prospect" | "hot" | "application" | "doc" | "dead"
export type Channel =
  | "email"
  | "sms"
  | "voice"
  | "whatsapp"
  | "telegram"
  | "signal"
  | "facebook"
  | "instagram"
  | "snapchat"

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: LeadStatus
  source: string
  value: string
  createdAt: Date
  lastContactedAt: Date | null
  nextFollowUpAt: Date | null
  contactAttempts: number
  documents: Document[]
  activities: Activity[]
  channels: ChannelStatus[]
  isDead: boolean
  deadReason?: string
}

export interface Document {
  id: string
  type: "application" | "bank_statement" | "id" | "other"
  name: string
  uploadedAt: Date
  status: "pending" | "received" | "verified"
}

export interface Activity {
  id: string
  type:
    | "call"
    | "email"
    | "sms"
    | "meeting"
    | "note"
    | "document"
    | "whatsapp"
    | "telegram"
    | "signal"
    | "facebook"
    | "instagram"
    | "snapchat"
  channel: Channel
  description: string
  timestamp: Date
  outcome: "success" | "no_answer" | "voicemail" | "bounced" | "delivered" | "read" | "replied"
  notes?: string
}

export interface ChannelStatus {
  channel: Channel
  enabled: boolean
  lastUsed: Date | null
  successRate: number
  totalAttempts: number
}

// Lead lifecycle rules
export const FOLLOW_UP_SCHEDULE = {
  new: { days: 0, channels: ["email", "sms"] }, // Immediate contact
  contacted: { days: 1, channels: ["voice", "email"] }, // Next day follow-up
  prospect: { days: 3, channels: ["sms", "whatsapp", "email"] }, // 3 days later
  hot: { days: 1, channels: ["voice", "sms", "email"] }, // Daily follow-up
  application: { days: 2, channels: ["email", "sms", "voice"] }, // Check for documents
  doc: { days: 7, channels: ["email"] }, // Weekly updates
}

export const DEAD_LEAD_THRESHOLD_DAYS = 180 // 6 months

// Calculate if lead should be marked dead
export function shouldMarkLeadDead(lead: Lead): boolean {
  if (lead.status === "doc" || lead.status === "dead") return false

  const daysSinceCreation = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const daysSinceLastContact = lead.lastContactedAt
    ? Math.floor((Date.now() - lead.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24))
    : daysSinceCreation

  return daysSinceCreation >= DEAD_LEAD_THRESHOLD_DAYS && daysSinceLastContact >= 30
}

// Get next follow-up date based on lead status
export function getNextFollowUpDate(lead: Lead): Date {
  const schedule = FOLLOW_UP_SCHEDULE[lead.status as keyof typeof FOLLOW_UP_SCHEDULE]
  if (!schedule) return new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 1 day

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + schedule.days)
  return nextDate
}

// Get recommended channels for next contact
export function getRecommendedChannels(lead: Lead): Channel[] {
  const schedule = FOLLOW_UP_SCHEDULE[lead.status as keyof typeof FOLLOW_UP_SCHEDULE]
  if (!schedule) return ["email", "sms"]

  // Filter to enabled channels with best success rates
  const enabledChannels = lead.channels
    .filter((c) => c.enabled && schedule.channels.includes(c.channel))
    .sort((a, b) => b.successRate - a.successRate)

  return enabledChannels.slice(0, 3).map((c) => c.channel)
}

// Check if all required documents are received
export function hasAllDocuments(lead: Lead): boolean {
  const requiredDocs = ["application", "bank_statement"]
  return requiredDocs.every((type) => lead.documents.some((doc) => doc.type === type && doc.status === "verified"))
}

// Progress lead to next status
export function progressLeadStatus(lead: Lead): LeadStatus {
  switch (lead.status) {
    case "new":
      return lead.contactAttempts > 0 ? "contacted" : "new"
    case "contacted":
      return lead.contactAttempts >= 3 ? "prospect" : "contacted"
    case "prospect":
      // Check for positive engagement
      const hasPositiveEngagement = lead.activities.some((a) => a.outcome === "replied" || a.outcome === "success")
      return hasPositiveEngagement ? "hot" : "prospect"
    case "hot":
      // Check if application started
      const hasApplication = lead.documents.some((d) => d.type === "application")
      return hasApplication ? "application" : "hot"
    case "application":
      // Check if all documents received
      return hasAllDocuments(lead) ? "doc" : "application"
    case "doc":
      return "doc" // Final status
    default:
      return lead.status
  }
}

// Generate automated follow-up message
export function generateFollowUpMessage(lead: Lead, channel: Channel): string {
  const templates = {
    new: {
      email: `Hi ${lead.name}, thank you for your interest! I'd love to discuss how we can help you. When would be a good time to connect?`,
      sms: `Hi ${lead.name}! Thanks for reaching out. Can we schedule a quick call to discuss your needs?`,
      voice: `Hello ${lead.name}, this is a follow-up call regarding your inquiry. I'd like to discuss how we can assist you.`,
    },
    contacted: {
      email: `Hi ${lead.name}, following up on our previous conversation. Do you have any questions I can help with?`,
      sms: `Hi ${lead.name}, just checking in! Let me know if you need any information.`,
      voice: `Hello ${lead.name}, I wanted to follow up and see if you had any questions about our services.`,
    },
    prospect: {
      email: `Hi ${lead.name}, I wanted to share some additional information that might be helpful for your decision.`,
      sms: `Hi ${lead.name}! Quick check-in - any questions about moving forward?`,
      voice: `Hello ${lead.name}, checking in to see if you're ready to move forward with the application.`,
    },
    hot: {
      email: `Hi ${lead.name}, excited to help you get started! Let's finalize the details and get your application submitted.`,
      sms: `Hi ${lead.name}! Ready to get started? Let me know when you can submit your application.`,
      voice: `Hello ${lead.name}, I'm calling to help you complete your application and get the process moving.`,
    },
    application: {
      email: `Hi ${lead.name}, we're still waiting on a few documents. Can you upload your bank statements when you get a chance?`,
      sms: `Hi ${lead.name}, reminder to upload your documents so we can process your application!`,
      voice: `Hello ${lead.name}, following up on the documents needed to complete your application.`,
    },
  }

  const statusTemplates = templates[lead.status as keyof typeof templates]
  if (!statusTemplates) return `Following up with ${lead.name}`

  return statusTemplates[channel as keyof typeof statusTemplates] || statusTemplates.email
}

// types/contact.ts
export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  company?: string
  title?: string
  leadScore: number
  status: "new" | "contacted" | "qualified" | "converted" | "unreachable"
  lastContacted?: Date
  notes?: string
  tags: string[]
  assignedTo: "unassigned" | "ai" | "human"
  assignedAt?: Date
}

export interface Campaign {
  id: string
  name: string
  type: "ai" | "human"
  contacts: Contact[]
  status: "draft" | "running" | "paused" | "completed" | "cancelled"
  progress: number
  startedAt?: Date
  completedAt?: Date
  results?: {
    contacted: number
    converted: number
    unreachable: number
  }
}
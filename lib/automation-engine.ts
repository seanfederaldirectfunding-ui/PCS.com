import { type Lead, type Activity, type Channel, generateFollowUpMessage } from "./lead-lifecycle"

export interface WorkflowTrigger {
  type: "lead_created" | "no_response" | "status_change" | "missing_docs" | "time_based"
  conditions: Record<string, any>
}

export interface WorkflowAction {
  type:
    | "send_email"
    | "send_sms"
    | "make_call"
    | "send_whatsapp"
    | "send_telegram"
    | "send_signal"
    | "send_facebook"
    | "send_instagram"
    | "send_snapchat"
    | "update_status"
    | "create_task"
    | "send_notification"
  channel?: Channel
  delay?: number // in minutes
  template?: string
  data?: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  active: boolean
  channels: Channel[]
}

// Execute a workflow for a lead
export async function executeWorkflow(workflow: Workflow, lead: Lead): Promise<Activity[]> {
  console.log(`[v0] Executing workflow: ${workflow.name} for lead: ${lead.name}`)

  const activities: Activity[] = []

  for (const action of workflow.actions) {
    // Simulate delay between actions
    if (action.delay) {
      await new Promise((resolve) => setTimeout(resolve, action.delay * 60 * 1000))
    }

    const activity = await executeAction(action, lead, workflow)
    if (activity) {
      activities.push(activity)
    }
  }

  return activities
}

// Execute a single action
async function executeAction(action: WorkflowAction, lead: Lead, workflow: Workflow): Promise<Activity | null> {
  console.log(`[v0] Executing action: ${action.type} for lead: ${lead.name}`)

  switch (action.type) {
    case "send_email":
      return {
        id: generateId(),
        type: "email",
        channel: "email",
        description: `Automated email sent via ${workflow.name}`,
        timestamp: new Date(),
        outcome: "delivered",
        notes: action.template || generateFollowUpMessage(lead, "email"),
      }

    case "send_sms":
      return {
        id: generateId(),
        type: "sms",
        channel: "sms",
        description: `Automated SMS sent via ${workflow.name}`,
        timestamp: new Date(),
        outcome: "delivered",
        notes: action.template || generateFollowUpMessage(lead, "sms"),
      }

    case "make_call":
      return {
        id: generateId(),
        type: "call",
        channel: "voice",
        description: `Automated call initiated via ${workflow.name}`,
        timestamp: new Date(),
        outcome: "no_answer", // Would be determined by actual call result
        notes: action.template || generateFollowUpMessage(lead, "voice"),
      }

    case "send_whatsapp":
      return {
        id: generateId(),
        type: "whatsapp",
        channel: "whatsapp",
        description: `Automated WhatsApp message via ${workflow.name}`,
        timestamp: new Date(),
        outcome: "delivered",
        notes: action.template || generateFollowUpMessage(lead, "whatsapp"),
      }

    case "send_telegram":
      return {
        id: generateId(),
        type: "telegram",
        channel: "telegram",
        description: `Automated Telegram message via ${workflow.name}`,
        timestamp: new Date(),
        outcome: "delivered",
        notes: action.template || generateFollowUpMessage(lead, "telegram"),
      }

    case "update_status":
      console.log(`[v0] Updating lead status for: ${lead.name}`)
      return null // Status updates don't create activities

    case "create_task":
      console.log(`[v0] Creating task for lead: ${lead.name}`)
      return null // Task creation handled separately

    default:
      console.log(`[v0] Unknown action type: ${action.type}`)
      return null
  }
}

// Check if a workflow should trigger for a lead
export function shouldTriggerWorkflow(workflow: Workflow, lead: Lead, event: string): boolean {
  if (!workflow.active) return false

  switch (workflow.trigger.type) {
    case "lead_created":
      return event === "lead_created"

    case "no_response":
      const daysSinceContact = lead.lastContactedAt
        ? Math.floor((Date.now() - lead.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 999
      return daysSinceContact >= (workflow.trigger.conditions.days || 3)

    case "status_change":
      return event === "status_change" && lead.status === workflow.trigger.conditions.status

    case "missing_docs":
      return event === "check_docs" && lead.status === "application" && lead.documents.length < 2

    case "time_based":
      // Check if it's time to run based on schedule
      return true

    default:
      return false
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Run all applicable workflows for a lead
export async function runWorkflowsForLead(lead: Lead, event: string, workflows: Workflow[]): Promise<Activity[]> {
  const allActivities: Activity[] = []

  for (const workflow of workflows) {
    if (shouldTriggerWorkflow(workflow, lead, event)) {
      console.log(`[v0] Triggering workflow: ${workflow.name} for lead: ${lead.name}`)
      const activities = await executeWorkflow(workflow, lead)
      allActivities.push(...activities)
    }
  }

  return allActivities
}

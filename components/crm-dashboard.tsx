"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  CheckSquare,
  TrendingUp,
  Mail,
  Calendar,
  Zap,
  Activity,
  BarChart3,
  Settings,
  FileSignature,
  CreditCard,
  Building2,
  FileText,
} from "lucide-react"
import { LeadsTab } from "@/components/crm-tabs/leads-tab"
import { TasksTab } from "@/components/crm-tabs/tasks-tab"
import { PipelineTab } from "@/components/crm-tabs/pipeline-tab"
import { EmailTab } from "@/components/crm-tabs/email-tab"
import { CalendarTab } from "@/components/crm-tabs/calendar-tab"
import { AutomationTab } from "@/components/crm-tabs/automation-tab"
import { ActivitiesTab } from "@/components/crm-tabs/activities-tab"
import { AnalyticsTab } from "@/components/crm-tabs/analytics-tab"
import { SettingsTab } from "@/components/crm-tabs/settings-tab"

export function CRMDashboard() {
  const [activeTab, setActiveTab] = useState("leads")

  const specialButtons = [
    { id: "sign", label: "PAGE SIGN", icon: FileSignature, color: "from-purple-500 to-purple-600" },
    { id: "ach", label: "PAGE ACH", icon: CreditCard, color: "from-green-500 to-green-600" },
    { id: "bank", label: "PAGE BANK", icon: Building2, color: "from-blue-500 to-blue-600" },
    { id: "applications", label: "APPLICATIONS", icon: FileText, color: "from-orange-500 to-orange-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Special Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {specialButtons.map((button) => (
          <Button
            key={button.id}
            className={`h-20 bg-gradient-to-r ${button.color} hover:opacity-90 text-white flex flex-col items-center justify-center gap-2`}
          >
            <button.icon className="h-6 w-6" />
            <span className="font-bold text-sm">{button.label}</span>
          </Button>
        ))}
      </div>

      {/* CRM Tabs */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-black/20 border-b border-white/10 rounded-none h-auto flex-wrap">
            <TabsTrigger value="leads" className="gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="leads" className="mt-0">
              <LeadsTab />
            </TabsContent>
            <TabsContent value="tasks" className="mt-0">
              <TasksTab />
            </TabsContent>
            <TabsContent value="pipeline" className="mt-0">
              <PipelineTab />
            </TabsContent>
            <TabsContent value="email" className="mt-0">
              <EmailTab />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0">
              <CalendarTab />
            </TabsContent>
            <TabsContent value="automation" className="mt-0">
              <AutomationTab />
            </TabsContent>
            <TabsContent value="activities" className="mt-0">
              <ActivitiesTab />
            </TabsContent>
            <TabsContent value="analytics" className="mt-0">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}

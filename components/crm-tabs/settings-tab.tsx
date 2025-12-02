"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Lock, Database } from "lucide-react"
import { APIStatusChecker } from "@/components/api-status-checker"
import { PhoneManager } from "@/components/phone-manager"
import { SocialPlatformManager } from "@/components/social-platform-manager"

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Settings className="h-5 w-5" />
        CRM Settings
      </h3>

      {/* API Integration Status */}
      <APIStatusChecker />

      {/* Phone Manager for SMS via personal phones */}
      <PhoneManager />

      {/* Social Platform Manager for WhatsApp, Telegram, Signal, Facebook, Instagram, Snapchat */}
      <SocialPlatformManager />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white/80">
                Company Name
              </Label>
              <Input id="company" defaultValue="PAGE CRM" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-white/80">
                Timezone
              </Label>
              <Input id="timezone" defaultValue="America/New_York" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white/80">
                Currency
              </Label>
              <Input id="currency" defaultValue="USD" className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-white/60">Receive email updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">SMS Alerts</p>
                <p className="text-xs text-white/60">Get SMS for urgent items</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Desktop Notifications</p>
                <p className="text-xs text-white/60">Show browser notifications</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                <p className="text-xs text-white/60">Add extra security layer</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Session Timeout</p>
                <p className="text-xs text-white/60">Auto logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10">
              Change Password
            </Button>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="bg-white/5 border-white/10 p-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Management
          </h4>
          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 justify-start">
              Export All Data
            </Button>
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 justify-start">
              Import Contacts
            </Button>
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 justify-start">
              Backup Database
            </Button>
            <Button
              variant="outline"
              className="w-full bg-red-500/20 border-red-400/30 hover:bg-red-500/30 text-red-400 justify-start"
            >
              Delete All Data
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
          Cancel
        </Button>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

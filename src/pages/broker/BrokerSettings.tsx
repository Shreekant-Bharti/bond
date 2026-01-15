import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Moon, Sun, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BrokerSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    demandAlerts: true,
    settlementAlerts: true,
    twoFactorAuth: false,
    darkMode: true,
  });

  return (
    <DashboardLayout title="Settings" subtitle="Manage your lister account preferences">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Quick Links */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/broker/profile')}
            >
              <Settings className="w-5 h-5" />
              <span>Edit Profile</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/broker/support')}
            >
              <Shield className="w-5 h-5" />
              <span>Get Support</span>
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
              <div>
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
              <div>
                <Label className="text-foreground">Demand Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified of high demand bonds</p>
              </div>
              <Switch 
                checked={settings.demandAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, demandAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
              <div>
                <Label className="text-foreground">Settlement Alerts</Label>
                <p className="text-xs text-muted-foreground">Notify on settlement completions</p>
              </div>
              <Switch 
                checked={settings.settlementAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, settlementAlerts: checked }))}
              />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
              <div>
                <Label className="text-foreground">Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            {settings.darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
            <div>
              <Label className="text-foreground">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Use dark theme</p>
            </div>
            <Switch 
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

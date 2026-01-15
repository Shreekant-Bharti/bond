import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBondContext } from "@/context/BondContext";
import { Building2, Mail, Shield, Save, CheckCircle } from "lucide-react";

const BROKER_PROFILE_KEY = 'bondfi_lister_profile';

interface BrokerProfile {
  organizationName: string;
  contactEmail: string;
  licenseId: string;
  contactName: string;
  contactPhone: string;
}

function loadBrokerProfile(): BrokerProfile {
  try {
    const stored = localStorage.getItem(BROKER_PROFILE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    organizationName: 'Alpha Securities',
    contactEmail: 'broker@bondfi.demo',
    licenseId: 'BRK-2023-45892',
    contactName: 'John Mitchell',
    contactPhone: '+1 (555) 234-5678',
  };
}

function saveBrokerProfile(profile: BrokerProfile): void {
  localStorage.setItem(BROKER_PROFILE_KEY, JSON.stringify(profile));
}

export default function BrokerProfile() {
  const { broker } = useBondContext();
  const [profile, setProfile] = useState<BrokerProfile>(loadBrokerProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveBrokerProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="Lister Profile" subtitle="View and manage your organization details">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{profile.organizationName}</h2>
              <p className="text-muted-foreground">Registered Lister</p>
            </div>
          </div>

          {/* Read-only Fields */}
          <div className="space-y-6 mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization Details</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  Organization Name
                </Label>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-foreground">
                  {profile.organizationName}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Contact Email
                </Label>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-foreground">
                  {profile.contactEmail}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  License / Registration ID
                </Label>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-foreground font-mono">
                  {profile.licenseId}
                </div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Editable Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={profile.contactName}
                  onChange={(e) => setProfile(prev => ({ ...prev, contactName: e.target.value }))}
                  className="bg-muted/20 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={profile.contactPhone}
                  onChange={(e) => setProfile(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="bg-muted/20 border-border/50"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="gap-2" size="lg">
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved Successfully
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Account Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/10 text-center">
                <p className="text-2xl font-bold text-primary">{broker.totalListings}</p>
                <p className="text-xs text-muted-foreground">Total Listings</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/10 text-center">
                <p className="text-2xl font-bold text-success">${(broker.transactionVolume / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Transaction Volume</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/10 text-center">
                <p className="text-2xl font-bold text-foreground">{broker.listedBonds.length}</p>
                <p className="text-xs text-muted-foreground">Active Bonds</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

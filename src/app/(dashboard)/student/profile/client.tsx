"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/features/notifications/preferences-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserRound } from "lucide-react";

export function ProfileClient({ profile }: { profile: any }) {
  const [preferences, setPreferences] = useState(
    profile.notification_preferences || { academic: true, placement: true, general: true, emergency: true }
  );
  const [loading, setLoading] = useState(false);

  const handleToggle = async (key: string, checked: boolean) => {
    const newPrefs = { ...preferences, [key]: checked };
    setPreferences(newPrefs);
    setLoading(true);
    
    const { error } = await updateNotificationPreferences(profile.id, newPrefs);
    if (error) {
      toast.error(error);
      setPreferences(preferences); // revert
    } else {
      toast.success("Preferences updated successfully");
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <UserRound className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label>Academic Alerts</Label>
              <span className="text-xs text-muted-foreground">Assignments, quizzes, and notes.</span>
            </div>
            <Switch 
              checked={preferences.academic} 
              onCheckedChange={(c: boolean) => handleToggle("academic", c)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label>Placement Updates</Label>
              <span className="text-xs text-muted-foreground">New drives and application statuses.</span>
            </div>
            <Switch 
              checked={preferences.placement} 
              onCheckedChange={(c: boolean) => handleToggle("placement", c)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label>General Announcements</Label>
              <span className="text-xs text-muted-foreground">Holidays, events, and college notices.</span>
            </div>
            <Switch 
              checked={preferences.general} 
              onCheckedChange={(c: boolean) => handleToggle("general", c)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label>Emergency Alerts</Label>
              <span className="text-xs text-muted-foreground">Critical notifications cannot be disabled.</span>
            </div>
            <Switch 
              checked={true} 
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { 
  updateOrganizationSettings, 
  createHoliday, 
  deleteHoliday, 
  updateUserRole 
} from "@/features/admin/settings-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, ShieldAlert, CalendarRange, Settings } from "lucide-react";

interface AdminSettingsClientProps {
  orgSettings: any;
  holidaysList: any[];
  usersList: any[];
  academicYears: any[];
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AdminSettingsClient({
  orgSettings,
  holidaysList,
  usersList,
  academicYears,
}: AdminSettingsClientProps) {
  // Org Settings State
  const [orgName, setOrgName] = useState<string>(orgSettings?.name || "Malla Reddy University");
  const [activeYearId, setActiveYearId] = useState<string>(orgSettings?.academic_year_id || "");
  const [workingDays, setWorkingDays] = useState<string[]>(orgSettings?.working_days || DAYS_OF_WEEK.slice(0, 6));
  const [savingOrg, setSavingOrg] = useState<boolean>(false);

  // Holiday Form State
  const [holidayName, setHolidayName] = useState<string>("");
  const [holidayDate, setHolidayDate] = useState<string>("");
  const [creatingHoliday, setCreatingHoliday] = useState<boolean>(false);

  // User Filter State
  const [userQuery, setUserQuery] = useState<string>("");

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    setWorkingDays(prev => 
      checked ? [...prev, day] : prev.filter(d => d !== day)
    );
  };

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    const res = await updateOrganizationSettings({
      name: orgName,
      workingDays,
      academicYearId: activeYearId
    });
    setSavingOrg(false);

    if (res.success) {
      toast.success("Organization settings updated.");
    } else {
      toast.error(res.error || "Failed to update settings.");
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) {
      toast.error("Please fill all holiday fields.");
      return;
    }

    setCreatingHoliday(true);
    const res = await createHoliday(holidayName.trim(), holidayDate);
    setCreatingHoliday(false);

    if (res.success) {
      toast.success("Holiday added successfully.");
      setHolidayName("");
      setHolidayDate("");
    } else {
      toast.error(res.error || "Failed to add holiday.");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    const res = await deleteHoliday(id);
    if (res.success) {
      toast.success("Holiday deleted.");
    } else {
      toast.error(res.error || "Failed to delete holiday.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      toast.success("User role updated successfully.");
    } else {
      toast.error(res.error || "Failed to update user role.");
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.full_name?.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.employee_or_student_id?.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <Tabs defaultValue="org" className="space-y-6">
      <TabsList>
        <TabsTrigger value="org" className="flex items-center gap-1">
          <Settings className="h-4 w-4" /> Institution Settings
        </TabsTrigger>
        <TabsTrigger value="holidays" className="flex items-center gap-1">
          <CalendarRange className="h-4 w-4" /> Holidays Calendar
        </TabsTrigger>
        <TabsTrigger value="roles" className="flex items-center gap-1">
          <ShieldAlert className="h-4 w-4" /> User Roles & RBAC
        </TabsTrigger>
      </TabsList>

      <TabsContent value="org">
        <Card>
          <CardHeader>
            <CardTitle>Institution Settings</CardTitle>
            <CardDescription>Configure primary institutional naming and working cycles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Institution Name</Label>
              <Input 
                id="org-name" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="active-year">Active Academic Year</Label>
              <Select value={activeYearId} onValueChange={setActiveYearId}>
                <SelectTrigger id="active-year">
                  <SelectValue placeholder="Select active year..." />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={ay.id}>
                      {ay.name} {ay.is_active ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 border p-4 rounded-md">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${day}`}
                      checked={workingDays.includes(day)}
                      onCheckedChange={(checked) => handleWorkingDayChange(day, !!checked)}
                    />
                    <label htmlFor={`day-${day}`} className="text-sm font-medium leading-none cursor-pointer">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveOrg} disabled={savingOrg}>
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="holidays">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Add Holiday</CardTitle>
              <CardDescription>Record a new holiday for academic scheduling calculations.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddHoliday} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="holiday-name">Holiday Description</Label>
                  <Input 
                    id="holiday-name" 
                    placeholder="e.g. Independence Day" 
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-date">Date</Label>
                  <Input 
                    id="holiday-date" 
                    type="date" 
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={creatingHoliday}>
                  <Plus className="h-4 w-4 mr-2" /> Add Holiday
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Holidays Registry</CardTitle>
              <CardDescription>Academic holidays currently recognized by the scheduler.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holiday Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidaysList.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-semibold">{holiday.name}</TableCell>
                      <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {holidaysList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        No holidays added to the calendar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="roles">
        <Card>
          <CardHeader>
            <CardTitle>Role Access Control (RBAC)</CardTitle>
            <CardDescription>View all system profiles and change user authorization roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 max-w-md">
              <Input 
                placeholder="Search by name, email or institutional ID..." 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Authorization Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold">{user.full_name}</TableCell>
                    <TableCell className="text-xs">{user.email}</TableCell>
                    <TableCell className="font-mono text-xs">{user.employee_or_student_id || "—"}</TableCell>
                    <TableCell>
                      <Select 
                        value={user.role} 
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="hod">Head of Department</SelectItem>
                          <SelectItem value="faculty">Faculty Instructor</SelectItem>
                          <SelectItem value="student">Student Profile</SelectItem>
                          <SelectItem value="placement">Placement Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      No matching user profile found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

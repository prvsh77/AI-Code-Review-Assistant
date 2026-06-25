import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Github, BrainCircuit, Bell, Monitor, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: profile, isLoading } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
          <TabsList className="flex flex-col h-auto bg-transparent items-start w-full md:w-48 space-y-1">
            <TabsTrigger value="profile" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-3 py-2">
              <UserIcon className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="github" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-3 py-2">
              <Github className="h-4 w-4" /> GitHub
            </TabsTrigger>
            <TabsTrigger value="models" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-3 py-2">
              <BrainCircuit className="h-4 w-4" /> LLM Models
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-3 py-2">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-3 py-2">
              <Monitor className="h-4 w-4" /> Appearance
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="profile" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={profile?.name} className="bg-background border-border" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={profile?.email} className="bg-background border-border" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" defaultValue={profile?.company || ""} className="bg-background border-border" />
                      </div>
                      <Button onClick={handleSave} className="mt-4"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>GitHub Integration</CardTitle>
                  <CardDescription>Manage your connected GitHub account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-4">
                      <Github className="h-8 w-8" />
                      <div>
                        <p className="font-medium text-foreground">{profile?.githubUsername || "Not connected"}</p>
                        <p className="text-sm text-muted-foreground">Connected since {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-border hover:bg-muted">Reconnect</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>AI Models</CardTitle>
                  <CardDescription>Configure which LLMs are used for different analysis tasks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Code Quality Agent</p>
                        <p className="text-sm text-muted-foreground">Used for general logic and style review.</p>
                      </div>
                      <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                        <option>GPT-4o</option>
                        <option>Claude 3.5 Sonnet</option>
                        <option>Gemini 1.5 Pro</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Agent</p>
                        <p className="text-sm text-muted-foreground">Specialized in vulnerability detection.</p>
                      </div>
                      <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                        <option>Claude 3.5 Sonnet</option>
                        <option>GPT-4o</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what events you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Review Completed</Label>
                        <p className="text-sm text-muted-foreground">Receive an email when an AI review finishes.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Critical Security Issue</Label>
                        <p className="text-sm text-muted-foreground">Immediate alert for critical vulnerabilities.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Summary</Label>
                        <p className="text-sm text-muted-foreground">A digest of code quality trends.</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">This application uses a strict dark theme tailored for developer tools. Light mode is not supported.</p>
                  <div className="p-4 rounded border border-primary bg-primary/5 flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-primary">Dark Mode Active</p>
                      <p className="text-xs text-muted-foreground">Your eyes will thank you later.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}

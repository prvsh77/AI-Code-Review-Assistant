import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Github, BrainCircuit, Bell, Monitor, User as UserIcon, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Settings() {
  const { data: profile, isLoading } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-5xl mx-auto">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight font-mono">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and application preferences.</p>
        </motion.div>

        <motion.div variants={item}>
          <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
            <TabsList className="flex flex-col h-auto bg-transparent items-start w-full md:w-56 space-y-1.5 p-0">
              <TabsTrigger value="profile" className="w-full justify-start gap-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/50 px-4 py-2.5 text-sm font-medium rounded-lg">
                <UserIcon className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="github" className="w-full justify-start gap-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/50 px-4 py-2.5 text-sm font-medium rounded-lg">
                <Github className="h-4 w-4" /> Integrations
              </TabsTrigger>
              <TabsTrigger value="models" className="w-full justify-start gap-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/50 px-4 py-2.5 text-sm font-medium rounded-lg">
                <BrainCircuit className="h-4 w-4" /> AI Models
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start gap-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/50 px-4 py-2.5 text-sm font-medium rounded-lg">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="w-full justify-start gap-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/50 px-4 py-2.5 text-sm font-medium rounded-lg">
                <Monitor className="h-4 w-4" /> Appearance
              </TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="profile" className="m-0 focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/5 pb-5">
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {isLoading ? (
                        <div className="space-y-6">
                          <Skeleton className="h-14 w-full" />
                          <Skeleton className="h-14 w-full" />
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="name" className="text-foreground">Full Name</Label>
                            <Input id="name" defaultValue={profile?.name} className="bg-background border-border/50 focus-visible:ring-primary h-10" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email" className="text-foreground">Email Address</Label>
                            <Input id="email" type="email" defaultValue={profile?.email} className="bg-background border-border/50 focus-visible:ring-primary h-10 text-muted-foreground" disabled />
                            <p className="text-xs text-muted-foreground">Email is managed by your connected GitHub account.</p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="company" className="text-foreground">Company (Optional)</Label>
                            <Input id="company" defaultValue={profile?.company || ""} className="bg-background border-border/50 focus-visible:ring-primary h-10" placeholder="Acme Inc." />
                          </div>
                          <div className="pt-4 border-t border-border/50">
                            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                              <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="github" className="m-0 focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/5 pb-5">
                      <CardTitle>Connected Accounts</CardTitle>
                      <CardDescription>Manage integrations with external services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-border/50 rounded-xl bg-background shadow-sm gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-[#24292e] rounded-full flex items-center justify-center">
                            <Github className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{profile?.githubUsername || "Not connected"}</p>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">Connected</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Read/write access to repositories</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-border/50 hover:bg-muted w-full sm:w-auto">Manage Access</Button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-border/50 rounded-xl bg-background/50 gap-4 opacity-70">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Jira Integration</p>
                            <p className="text-sm text-muted-foreground mt-1">Automatically create tickets for issues</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-border/50 hover:bg-muted w-full sm:w-auto">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="models" className="m-0 focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/5 pb-5">
                      <CardTitle>AI Models Configuration</CardTitle>
                      <CardDescription>Select which LLMs power different analysis agents.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg bg-background border border-border/50">
                          <div className="max-w-md">
                            <p className="font-semibold text-foreground">Code Quality Agent</p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">General logic, style review, and complexity analysis. Claude 3.5 Sonnet is recommended for optimal performance.</p>
                          </div>
                          <select className="bg-card border border-border/50 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full sm:w-48 h-10">
                            <option value="claude">Claude 3.5 Sonnet</option>
                            <option value="gpt4o">GPT-4o</option>
                            <option value="gemini">Gemini 1.5 Pro</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg bg-background border border-border/50">
                          <div className="max-w-md">
                            <p className="font-semibold text-foreground">Security Agent</p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Specialized in vulnerability detection and OWASP mapping. GPT-4o often catches edge cases better here.</p>
                          </div>
                          <select className="bg-card border border-border/50 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary w-full sm:w-48 h-10">
                            <option value="gpt4o">GPT-4o</option>
                            <option value="claude">Claude 3.5 Sonnet</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Save className="mr-2 h-4 w-4" /> Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications" className="m-0 focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/5 pb-5">
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Choose what events trigger alerts and emails.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-semibold">Review Completed</Label>
                            <p className="text-sm text-muted-foreground">Receive an email when an AI review finishes.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="h-px bg-border/50 w-full" />
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-semibold text-red-400">Critical Security Issue</Label>
                            <p className="text-sm text-muted-foreground">Immediate alert for critical vulnerabilities.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="h-px bg-border/50 w-full" />
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-semibold">Weekly Summary</Label>
                            <p className="text-sm text-muted-foreground">A digest of code quality trends across all repos.</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="appearance" className="m-0 focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/5 pb-5">
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize the look of the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This application uses a strict dark theme tailored for developer tools. Light mode is not supported by design to reduce eye strain during long coding sessions.
                      </p>
                      <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-4 relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="p-3 bg-background rounded-full border border-primary/20 shadow-[0_0_15px_rgba(0,188,212,0.2)]">
                          <Monitor className="h-6 w-6 text-primary" />
                        </div>
                        <div className="relative z-10">
                          <p className="font-semibold text-primary tracking-wide">Dark Mode Enforced</p>
                          <p className="text-sm text-muted-foreground mt-0.5">System defaults to the enterprise dark navy theme.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
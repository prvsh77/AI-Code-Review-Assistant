import { AppLayout } from "@/components/layout/AppLayout";
import { useGetUserProfile, getGetUserProfileQueryKey, useGetUserActivity, getGetUserActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, FolderGit2, GitPullRequest, ShieldAlert, CheckCircle2, MapPin, Building, Calendar, Mail, Activity, Code2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const { data: activities, isLoading: activitiesLoading } = useGetUserActivity({ query: { queryKey: getGetUserActivityQueryKey() } });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review_completed': return <div className="text-green-500 bg-green-500/10 p-2 rounded-full border border-green-500/20"><CheckCircle2 className="h-4 w-4" /></div>;
      case 'pr_analyzed': return <div className="text-blue-500 bg-blue-500/10 p-2 rounded-full border border-blue-500/20"><GitPullRequest className="h-4 w-4" /></div>;
      case 'security_found': return <div className="text-red-500 bg-red-500/10 p-2 rounded-full border border-red-500/20"><ShieldAlert className="h-4 w-4" /></div>;
      case 'repository_added': return <div className="text-primary bg-primary/10 p-2 rounded-full border border-primary/20"><FolderGit2 className="h-4 w-4" /></div>;
      default: return <div className="text-muted-foreground bg-muted p-2 rounded-full border border-border"><Activity className="h-4 w-4" /></div>;
    }
  };

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
        
        {/* Banner Area */}
        <motion.div variants={item} className="relative rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm h-48 md:h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
          {/* Profile Sidebar */}
          <motion.div variants={item} className="lg:col-span-1 space-y-6 -mt-20 sm:-mt-24 relative z-10">
            <Card className="bg-card border-border/60 shadow-xl overflow-hidden">
              <CardContent className="px-6 pb-6 pt-0 text-center">
                <div className="flex justify-center -mt-16 mb-5 relative inline-block mx-auto">
                  {profileLoading ? (
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-card" />
                  ) : (
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-card bg-card shadow-xl">
                        <AvatarImage src={profile?.avatarUrl || undefined} />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">{profile?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-[3px] border-card rounded-full shadow-sm" title="Online" />
                    </div>
                  )}
                </div>
                
                {profileLoading ? (
                  <div className="space-y-3 text-center">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                ) : (
                  <div className="text-center space-y-1.5 mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{profile?.name}</h2>
                    <p className="text-sm font-mono text-muted-foreground flex items-center justify-center gap-2">
                      <Github className="h-4 w-4" />
                      {profile?.githubUsername}
                    </p>
                  </div>
                )}

                <div className="space-y-4 text-sm text-muted-foreground text-left bg-muted/10 p-5 rounded-xl border border-border/50">
                  {profileLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <>
                      <div className="flex items-center gap-3 font-medium text-foreground/80">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>{profile?.email}</span>
                      </div>
                      {profile?.company && (
                        <div className="flex items-center gap-3 font-medium text-foreground/80">
                          <Building className="h-4 w-4 text-primary" />
                          <span>{profile?.company}</span>
                        </div>
                      )}
                      {profile?.timezone && (
                        <div className="flex items-center gap-3 font-medium text-foreground/80">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{profile?.timezone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 font-medium text-foreground/80">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Joined {profile?.joinedAt ? format(new Date(profile.joinedAt), 'MMMM yyyy') : ''}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8 mt-2 sm:mt-0">
            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Repositories", value: profile?.totalRepositories || 12, icon: FolderGit2, color: "text-blue-500" },
                { label: "Reviews", value: profile?.totalReviews || 156, icon: GitPullRequest, color: "text-purple-500" },
                { label: "Issues Found", value: 47, icon: ShieldAlert, color: "text-red-500" },
                { label: "Avg Score", value: "84.5", icon: Code2, color: "text-green-500" }
              ].map((stat, i) => (
                <Card key={i} className="bg-card border-border/60 shadow-sm hover:border-border transition-colors">
                  <CardContent className="p-5 flex flex-col justify-center text-center">
                    <stat.icon className={`h-5 w-5 mx-auto mb-2 opacity-50 ${stat.color}`} />
                    {profileLoading ? <Skeleton className="h-8 w-16 mx-auto mb-1" /> : <span className="text-3xl font-bold font-mono">{stat.value}</span>}
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">{stat.label}</span>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Activity Feed */}
            <motion.div variants={item}>
              <Card className="bg-card border-border/60 shadow-sm min-h-[400px]">
                <CardHeader className="border-b border-border/50 bg-muted/5 pb-5">
                  <CardTitle className="text-lg">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 px-6 sm:px-8">
                  {activitiesLoading ? (
                    <div className="space-y-8">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities && activities.length > 0 ? (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-border/50">
                      {activities.map((activity) => (
                        <div key={activity.id} className="relative flex items-start gap-6 group">
                          <div className="relative z-10 shrink-0 mt-1 shadow-sm transition-transform group-hover:scale-110">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 bg-background border border-border/50 p-4 rounded-xl shadow-sm hover:border-border transition-colors">
                            <p className="text-[15px] text-foreground/90 font-medium leading-relaxed">{activity.description}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                              {activity.repositoryName && (
                                <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                  {activity.repositoryName}
                                </span>
                              )}
                              <time dateTime={activity.createdAt} className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                              </time>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                      <Activity className="h-12 w-12 opacity-20 mb-4" />
                      <p className="text-lg font-medium text-foreground">No recent activity</p>
                      <p className="text-sm mt-1">Actions will appear here as you use the platform.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}

// Mock clock icon
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetUserProfile, getGetUserProfileQueryKey, useGetUserActivity, getGetUserActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, FolderGit2, GitPullRequest, ShieldAlert, CheckCircle2, MapPin, Building, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const { data: activities, isLoading: activitiesLoading } = useGetUserActivity({ query: { queryKey: getGetUserActivityQueryKey() } });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review_completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pr_analyzed': return <GitPullRequest className="h-4 w-4 text-blue-500" />;
      case 'security_found': return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'repository_added': return <FolderGit2 className="h-4 w-4 text-primary" />;
      default: return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-card border-border overflow-hidden">
              <div className="h-24 bg-muted border-b border-border w-full relative">
                {/* Banner */}
              </div>
              <CardContent className="px-6 pb-6 pt-0 relative">
                <div className="flex justify-center -mt-12 mb-4">
                  {profileLoading ? (
                    <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
                  ) : (
                    <Avatar className="h-24 w-24 border-4 border-card bg-card shadow-sm">
                      <AvatarImage src={profile?.avatarUrl || undefined} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">{profile?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                
                {profileLoading ? (
                  <div className="space-y-2 text-center">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                ) : (
                  <div className="text-center space-y-1 mb-6">
                    <h2 className="text-xl font-bold tracking-tight">{profile?.name}</h2>
                    <p className="text-sm font-mono text-muted-foreground flex items-center justify-center gap-1.5">
                      <Github className="h-3.5 w-3.5" />
                      {profile?.githubUsername}
                    </p>
                  </div>
                )}

                <div className="space-y-3 text-sm text-muted-foreground">
                  {profileLoading ? (
                    <Skeleton className="h-4 w-full" />
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-foreground/70" />
                        <span>{profile?.email}</span>
                      </div>
                      {profile?.company && (
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-foreground/70" />
                          <span>{profile?.company}</span>
                        </div>
                      )}
                      {profile?.timezone && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-foreground/70" />
                          <span>{profile?.timezone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-foreground/70" />
                        <span>Joined {profile?.joinedAt ? format(new Date(profile.joinedAt), 'MMM yyyy') : ''}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/20 border border-border/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{profile?.totalRepositories || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Repositories</div>
                    </div>
                    <div className="p-3 bg-muted/20 border border-border/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-foreground">{profile?.totalReviews || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Reviews</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-card border-border h-full">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {activitiesLoading ? (
                  <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="relative flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 z-10 shadow-sm relative">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 bg-muted/10 border border-border/50 p-4 rounded-lg">
                          <p className="text-sm text-foreground">{activity.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            {activity.repositoryName && (
                              <Badge variant="outline" className="font-mono bg-background">
                                {activity.repositoryName}
                              </Badge>
                            )}
                            <time dateTime={activity.createdAt}>
                              {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                            </time>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No recent activity found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

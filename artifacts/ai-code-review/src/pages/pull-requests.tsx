import { AppLayout } from "@/components/layout/AppLayout";
import { useListPullRequests, getListPullRequestsQueryKey, useTriggerReview } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GitPullRequest, GitMerge, XCircle, Clock, Play, FileText, GitCommit, GitBranch, ArrowRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function PullRequests() {
  const [_, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const repositoryId = searchParams.get("repositoryId") ? Number(searchParams.get("repositoryId")) : undefined;

  const { data: prs, isLoading } = useListPullRequests(
    { repositoryId },
    { query: { queryKey: getListPullRequestsQueryKey({ repositoryId }) } }
  );

  const triggerReview = useTriggerReview();

  const handleTriggerReview = (prId: number) => {
    triggerReview.mutate({ id: prId }, {
      onSuccess: (data) => {
        setLocation(`/analysis/${data.jobId}`);
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <GitPullRequest className="h-5 w-5 text-green-500" />;
      case "merged": return <GitMerge className="h-5 w-5 text-purple-500" />;
      case "closed": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getRiskScoreBadge = (score: number) => {
    if (score < 40) return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Critical Risk</Badge>;
    if (score < 70) return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">High Risk</Badge>;
    if (score < 85) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium Risk</Badge>;
    return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Low Risk</Badge>;
  };

  const renderPRList = (filteredPRs: typeof prs) => {
    if (isLoading) {
      return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <motion.div variants={item} key={i}>
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    if (!filteredPRs || filteredPRs.length === 0) {
      return (
        <motion.div variants={item} initial="hidden" animate="show" className="py-16 text-center border border-dashed border-border/50 rounded-xl bg-card/20 mt-6">
          <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No pull requests found</h3>
          <p className="text-muted-foreground mt-1">There are no pull requests matching the current filter.</p>
        </motion.div>
      );
    }

    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 mt-6">
        {filteredPRs.map((pr) => (
          <motion.div variants={item} key={pr.id}>
            <Card className="bg-card border-border hover:border-primary/40 hover:shadow-[0_4px_20px_-5px_rgba(0,188,212,0.1)] transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                  {/* Left: Author & Title */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="mt-1">
                      {getStatusIcon(pr.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer">{pr.title}</h3>
                        <Badge variant="secondary" className="font-mono text-xs bg-muted/50">#{pr.number}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5 border border-border">
                            <AvatarImage src={pr.authorAvatar || undefined} />
                            <AvatarFallback className="text-[8px]">{pr.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{pr.author}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-xs bg-muted/30 px-2 py-0.5 rounded-md border border-border/50">
                          <GitBranch className="h-3 w-3" />
                          <span className="font-mono">feat/update-api</span>
                        </div>
                        <span>•</span>
                        <span>{format(new Date(pr.createdAt), 'MMM d, yyyy')}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{pr.filesChanged} files</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitCommit className="h-3.5 w-3.5" />
                          <span>{pr.commits} commits</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-primary/80">
                          <Clock className="h-3.5 w-3.5" />
                          <span>~{Math.max(1, Math.floor(pr.filesChanged / 2))} min review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Badges & Actions */}
                  <div className="flex items-center gap-4 w-full xl:w-auto xl:justify-end border-t xl:border-t-0 border-border/50 pt-4 xl:pt-0 shrink-0">
                    <div className="flex items-center gap-3 mr-auto xl:mr-4">
                      {/* Mock risk score based on PR ID */}
                      {getRiskScoreBadge(80 - (pr.id % 50))}
                      
                      {pr.reviewStatus === "completed" ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Reviewed</Badge>
                      ) : pr.reviewStatus === "analyzing" ? (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" /> Analyzing</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted/50 text-muted-foreground">Pending</Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground h-9 font-medium">
                        View Diff
                      </Button>
                      <Button 
                        onClick={() => handleTriggerReview(pr.id)}
                        disabled={triggerReview.isPending || pr.reviewStatus === "analyzing"}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 font-medium shadow-sm"
                      >
                        {pr.reviewStatus === "completed" ? (
                          <>Re-analyze</>
                        ) : (
                          <><Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Review AI</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const openCount = prs?.filter(pr => pr.status === "open").length || 0;
  const mergedCount = prs?.filter(pr => pr.status === "merged").length || 0;
  const closedCount = prs?.filter(pr => pr.status === "closed").length || 0;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight font-mono">Pull Requests</h1>
          <p className="text-muted-foreground mt-1">Trigger and view AI code reviews for pull requests.</p>
        </motion.div>

        <motion.div variants={item}>
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 space-x-6">
              <TabsTrigger value="open" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none">
                Open <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">{openCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="merged" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none">
                Merged <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">{mergedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="closed" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none">
                Closed <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">{closedCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="open" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {renderPRList(prs?.filter(pr => pr.status === "open"))}
            </TabsContent>
            <TabsContent value="merged" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {renderPRList(prs?.filter(pr => pr.status === "merged"))}
            </TabsContent>
            <TabsContent value="closed" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {renderPRList(prs?.filter(pr => pr.status === "closed"))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
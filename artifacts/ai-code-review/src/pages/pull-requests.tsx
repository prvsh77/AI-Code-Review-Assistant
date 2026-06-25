import { AppLayout } from "@/components/layout/AppLayout";
import { useListPullRequests, getListPullRequestsQueryKey, useTriggerReview } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GitPullRequest, CheckCircle2, XCircle, Clock, Play } from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><GitPullRequest className="mr-1 h-3 w-3" /> Open</Badge>;
      case "merged": return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20"><CheckCircle2 className="mr-1 h-3 w-3" /> Merged</Badge>;
      case "closed": return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="mr-1 h-3 w-3" /> Closed</Badge>;
      default: return null;
    }
  };

  const getReviewStatusBadge = (status?: string) => {
    switch (status) {
      case "completed": return <Badge variant="secondary" className="bg-primary/10 text-primary">Review Completed</Badge>;
      case "analyzing": return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500"><Clock className="mr-1 h-3 w-3" /> Analyzing...</Badge>;
      case "pending": return <Badge variant="outline" className="text-muted-foreground">Pending Review</Badge>;
      default: return null;
    }
  };

  const renderPRList = (filteredPRs: typeof prs) => {
    if (isLoading) {
      return (
        <div className="space-y-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!filteredPRs || filteredPRs.length === 0) {
      return (
        <div className="py-12 text-center border border-dashed border-border rounded-lg bg-card/30 mt-6">
          <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No pull requests found</h3>
          <p className="text-muted-foreground">There are no pull requests matching the current filter.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        {filteredPRs.map((pr) => (
          <Card key={pr.id} className="bg-card border-border hover:border-border/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={pr.authorAvatar || undefined} />
                    <AvatarFallback>{pr.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{pr.title}</h3>
                      {getStatusBadge(pr.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="font-mono text-primary">#{pr.number}</span>
                      <span>opened by <span className="font-medium text-foreground">{pr.author}</span></span>
                      <span>in <span className="font-medium text-foreground">{pr.repositoryName}</span></span>
                      <span>•</span>
                      <span>{format(new Date(pr.createdAt), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{pr.filesChanged} files</span>
                      <span>{pr.commits} commits</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                  {getReviewStatusBadge(pr.reviewStatus)}
                  <Button 
                    onClick={() => handleTriggerReview(pr.id)}
                    disabled={triggerReview.isPending || pr.reviewStatus === "analyzing"}
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {pr.reviewStatus === "completed" ? "Re-analyze" : "Analyze AI"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">Pull Requests</h1>
          <p className="text-muted-foreground">Trigger and view AI code reviews for pull requests.</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="merged">Merged</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {renderPRList(prs)}
          </TabsContent>
          <TabsContent value="open">
            {renderPRList(prs?.filter(pr => pr.status === "open"))}
          </TabsContent>
          <TabsContent value="merged">
            {renderPRList(prs?.filter(pr => pr.status === "merged"))}
          </TabsContent>
          <TabsContent value="closed">
            {renderPRList(prs?.filter(pr => pr.status === "closed"))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

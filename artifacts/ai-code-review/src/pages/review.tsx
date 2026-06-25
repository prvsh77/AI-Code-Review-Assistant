import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReview, getGetReviewQueryKey, useGetReviewFiles, getGetReviewFilesQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Zap, BookOpen, Code2, AlertTriangle, FileCode2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);

  const { data: review, isLoading: reviewLoading } = useGetReview(reviewId, { query: { queryKey: getGetReviewQueryKey(reviewId) } });
  const { data: files, isLoading: filesLoading } = useGetReviewFiles(reviewId, { query: { queryKey: getGetReviewFilesQueryKey(reviewId) } });

  const scoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight font-mono">Review Report</h1>
              {reviewLoading ? <Skeleton className="h-6 w-20" /> : <Badge variant="secondary" className="bg-primary/10 text-primary">#{review?.pullRequestNumber}</Badge>}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              {reviewLoading ? <Skeleton className="h-4 w-40" /> : (
                <>
                  <span>{review?.repositoryName}</span>
                  <span>•</span>
                  <span>by {review?.author}</span>
                  <span>•</span>
                  <span>{review?.reviewedAt ? format(new Date(review.reviewedAt), 'MMM d, yyyy') : ''}</span>
                </>
              )}
            </p>
          </div>
          <Link href={`/review/${reviewId}/code`}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Code2 className="mr-2 h-4 w-4" />
              View Code & Comments
            </Button>
          </Link>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <Code2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {reviewLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className={`text-3xl font-bold ${scoreColor(review?.qualityScore || 0)}`}>{review?.qualityScore}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {reviewLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className={`text-3xl font-bold ${scoreColor(review?.securityScore || 0)}`}>{review?.securityScore}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complexity Score</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {reviewLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className={`text-3xl font-bold ${scoreColor(review?.complexityScore || 0)}`}>{review?.complexityScore}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentation Score</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {reviewLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className={`text-3xl font-bold ${scoreColor(review?.documentationScore || 0)}`}>{review?.documentationScore}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {review?.aiSummary || "No summary available."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Files Changed</CardTitle>
                <CardDescription>Files analyzed in this review</CardDescription>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files?.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <FileCode2 className="h-4 w-4 text-muted-foreground" />
                              {file.filePath}
                              {file.status === "added" && <Badge variant="outline" className="ml-2 text-green-500 border-green-500/20 bg-green-500/10 text-[10px] uppercase">New</Badge>}
                              {file.status === "deleted" && <Badge variant="outline" className="ml-2 text-red-500 border-red-500/20 bg-red-500/10 text-[10px] uppercase">Del</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 text-xs font-mono">
                              <span className="text-green-500">+{file.additions}</span>
                              <span className="text-destructive">-{file.deletions}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/review/${reviewId}/code?file=${encodeURIComponent(file.filePath)}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Top Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {review?.topIssues?.map((issue, i) => (
                      <li key={i} className="flex gap-3 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{issue}</p>
                      </li>
                    ))}
                    {!review?.topIssues?.length && (
                      <li className="text-sm text-muted-foreground text-center py-4">No major issues found.</li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

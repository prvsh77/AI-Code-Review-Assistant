import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetQualityTrend, getGetQualityTrendQueryKey, useGetLanguageBreakdown, getGetLanguageBreakdownQueryKey, useListReviews, getListReviewsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderGit2, GitPullRequest, FileCode2, Activity, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: trend, isLoading: trendLoading } = useGetQualityTrend({}, { query: { queryKey: getGetQualityTrendQueryKey({}) } });
  const { data: languages, isLoading: langLoading } = useGetLanguageBreakdown({ query: { queryKey: getGetLanguageBreakdownQueryKey() } });
  const { data: reviews, isLoading: reviewsLoading } = useListReviews({ limit: 5 }, { query: { queryKey: getListReviewsQueryKey({ limit: 5 }) } });

  const scoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Overview</h1>
          <p className="text-muted-foreground">Monitor your team's code quality and AI review metrics.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{stats?.totalRepositories}</div>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
              <GitPullRequest className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{stats?.totalPullRequests}</div>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Reviewed</CardTitle>
              <FileCode2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{stats?.filesReviewed}</div>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className={`text-2xl font-bold ${scoreColor(stats?.overallScore || 0)}`}>{stats?.overallScore}/100</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trend Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Code Quality Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {trendLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => format(new Date(val), 'MMM d')} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                        labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                      />
                      <Line type="monotone" dataKey="qualityScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Quality" />
                      <Line type="monotone" dataKey="securityScore" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Security" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Language Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {langLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languages} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="language" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                        formatter={(val) => [`${val}%`, 'Usage']}
                      />
                      <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                        {languages?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>PR</TableHead>
                      <TableHead>Repository</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews?.map((review) => (
                      <TableRow key={review.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-mono text-primary">#{review.pullRequestNumber}</TableCell>
                        <TableCell className="font-medium">{review.repositoryName}</TableCell>
                        <TableCell>{review.author}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${scoreColor(review.qualityScore)}`}>{review.qualityScore}</span>
                            {review.securityScore < 70 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/review/${review.id}`} className="text-sm text-primary hover:underline">
                            View Report
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reviews?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No recent reviews found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

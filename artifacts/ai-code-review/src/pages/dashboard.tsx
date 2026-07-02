import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetQualityTrend, getGetQualityTrendQueryKey, useGetLanguageBreakdown, getGetLanguageBreakdownQueryKey, useListReviews, getListReviewsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderGit2, GitPullRequest, FileCode2, Activity, ShieldAlert, Zap, BookOpen, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/ui/metric-card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { normalizeArray } from "@/lib/utils";
import { GitHubEmptyState } from "@/components/GitHubEmptyState";

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

export default function Dashboard() {

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey(),
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  const isGithubConnected = (stats as any)?.githubConnected !== false;

  const { data: trend, isLoading: trendLoading } = useGetQualityTrend({}, {
    query: {
      queryKey: getGetQualityTrendQueryKey({}),
      enabled: isGithubConnected,
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  const { data: languagesResponse, isLoading: langLoading } =
    useGetLanguageBreakdown({
      query: {
        queryKey: getGetLanguageBreakdownQueryKey(),
        enabled: isGithubConnected,
        retry: false,
        refetchOnWindowFocus: false,
      },
    });

  const languageData = normalizeArray<{ language: string; percentage: number }>(languagesResponse, "LanguageBreakdown");
  const trendData = normalizeArray<{ date: string; qualityScore: number; securityScore: number }>(trend, "QualityTrend");
  const { data: reviews, isLoading: reviewsLoading } = useListReviews({ limit: 5 }, {
    query: {
      queryKey: getListReviewsQueryKey({ limit: 5 }),
      enabled: isGithubConnected,
      retry: false,
      refetchOnWindowFocus: false,
    }
  });
  const reviewData = normalizeArray<any>(reviews, "RecentReviews");


  const scoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (score >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Good morning, John</h1>
            <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
          </div>
          {isGithubConnected && (
            <button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm text-sm">
              Sync Now
            </button>
          )}
        </motion.div>

        {statsLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : !isGithubConnected ? (
          <GitHubEmptyState />
        ) : (
          <>
            {/* Stats Row */}
            <motion.div variants={item} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Repositories"
                value={statsLoading ? "-" : stats?.totalRepositories || 0}
                icon={FolderGit2}
                trend={12}
                color="primary"
                trendLabel="this week"
              />
              <MetricCard
                title="Pull Requests"
                value={statsLoading ? "-" : stats?.totalPullRequests || 0}
                icon={GitPullRequest}
                trend={5}
                color="blue"
                trendLabel="this week"
              />
              <MetricCard
                title="Files Reviewed"
                value={statsLoading ? "-" : stats?.filesReviewed || 0}
                icon={FileCode2}
                trend={-2}
                color="yellow"
                trendLabel="this week"
              />
              <motion.div whileHover={{ scale: 1.01 }} className="h-full">
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors shadow-sm">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                    {statsLoading ? (
                      <Skeleton className="h-24 w-24 rounded-full" />
                    ) : (
                      <ScoreRing score={stats?.overallScore || 0} size="md" label="Overall Score" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Trend Chart */}
              <Card className="bg-card/50 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Code Quality Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {trendLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => format(new Date(val), 'MMM d')} axisLine={false} tickLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} axisLine={false} tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                            labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                          />
                          <Area type="monotone" dataKey="qualityScore" stroke="hsl(var(--primary))" fill="url(#colorQuality)" strokeWidth={2} name="Quality" />
                          <Area type="monotone" dataKey="securityScore" stroke="hsl(var(--destructive))" fill="url(#colorSecurity)" strokeWidth={2} name="Security" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="bg-card/50 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Language Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {langLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={languageData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                          <YAxis dataKey="language" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                            formatter={(val) => [`${val}%`, 'Usage']}
                            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                          />
                          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                            {languageData?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card/50 border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {reviewsLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/50">
                          <TableHead className="pl-6">PR</TableHead>
                          <TableHead>Repository</TableHead>
                          <TableHead>Scores</TableHead>
                          <TableHead className="text-right pr-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviewData.map((review) => (
                          <TableRow key={review.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-border">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{review.author ? review.author.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
                                </Avatar>
                                <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md text-xs">#{review.pullRequestNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{review.repositoryName}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={`${scoreColor(review.qualityScore)}`}>Q: {review.qualityScore}</Badge>
                                <Badge variant="outline" className={`${scoreColor(review.securityScore)}`}>S: {review.securityScore}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Link href={`/review/${review.id}`}>
                                <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors border border-border bg-background px-3 py-1.5 rounded-md hover:border-primary/50">
                                  View
                                </button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                        {reviewData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No recent reviews found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 shadow-sm flex flex-col">
                <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                  <CardTitle>Recent AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                  <div className="space-y-4">
                    {[
                      { icon: ShieldAlert, title: "SQL Injection Risk", severity: "Critical", color: "red", desc: "Found unsanitized input in user query." },
                      { icon: Zap, title: "High Complexity", severity: "Medium", color: "yellow", desc: "Function parseData() exceeds cyclomatic complexity 15." },
                      { icon: BookOpen, title: "Missing Docs", severity: "Low", color: "blue", desc: "API endpoint /v1/users lacks OpenAPI documentation." },
                      { icon: AlertTriangle, title: "Memory Leak", severity: "High", color: "orange", desc: "Unclosed event listener in useEffect." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:border-border transition-colors">
                        <div className={`mt-0.5 p-1.5 rounded bg-${item.color}-500/10 text-${item.color}-500 h-fit`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">{item.title}</span>
                            <Badge variant="outline" className={`bg-${item.color}-500/10 text-${item.color}-500 border-${item.color}-500/20 text-[10px] uppercase tracking-wider px-1.5 py-0`}>
                              {item.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
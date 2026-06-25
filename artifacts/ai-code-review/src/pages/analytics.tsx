import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetQualityTrend, getGetQualityTrendQueryKey, useGetLanguageBreakdown, getGetLanguageBreakdownQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { format } from "date-fns";
import { Activity, Code, ShieldCheck, Zap } from "lucide-react";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: trend, isLoading: trendLoading } = useGetQualityTrend({ days: 30 }, { query: { queryKey: getGetQualityTrendQueryKey({ days: 30 }) } });
  const { data: languages, isLoading: langLoading } = useGetLanguageBreakdown({ query: { queryKey: getGetLanguageBreakdownQueryKey() } });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into codebase metrics and trends over time.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviews This Week</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{stats?.reviewsThisWeek || 0}</div>}
              <p className="text-xs text-green-500 mt-1">+12% from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Files Analyzed</CardTitle>
              <Code className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{stats?.filesReviewed || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">Total historical</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issues Found</CardTitle>
              <ShieldCheck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{stats?.issuesFound || 0}</div>}
              <p className="text-xs text-muted-foreground mt-1">Total historical</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Complexity</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {/* Mock stat since it's not directly in DashboardStats */}
              <div className="text-3xl font-bold text-foreground">B+</div>
              <p className="text-xs text-green-500 mt-1">Improving trend</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Quality Trend */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Score History (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {trendLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => format(new Date(val), 'MMM d')} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 100]} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '6px' }}
                        labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                      />
                      <Area type="monotone" dataKey="qualityScore" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorQuality)" name="Quality" />
                      <Area type="monotone" dataKey="securityScore" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorSecurity)" name="Security" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language Usage */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Language Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {langLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languages} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="language" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      />
                      <Bar dataKey="count" name="Files" radius={[4, 4, 0, 0]}>
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

          {/* Hot Files (Mocked) */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Hot Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "src/api/auth.ts", issues: 12, complexity: "High" },
                  { name: "src/components/DataTable.tsx", issues: 8, complexity: "Medium" },
                  { name: "lib/utils/crypto.go", issues: 5, complexity: "High" },
                  { name: "config/database.yml", issues: 3, complexity: "Low" },
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-md border border-border/50 bg-muted/10">
                    <div className="font-mono text-sm text-foreground truncate max-w-[200px]">{file.name}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-destructive font-medium">{file.issues} issues</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        file.complexity === 'High' ? 'bg-red-500/20 text-red-500' :
                        file.complexity === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>{file.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

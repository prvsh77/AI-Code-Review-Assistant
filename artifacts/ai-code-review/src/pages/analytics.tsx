import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetQualityTrend, getGetQualityTrendQueryKey, useGetLanguageBreakdown, getGetLanguageBreakdownQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { Activity, Code, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: trend, isLoading: trendLoading } = useGetQualityTrend({ days: 30 }, { query: { queryKey: getGetQualityTrendQueryKey({ days: 30 }) } });
  const { data: languages, isLoading: langLoading } = useGetLanguageBreakdown({ query: { queryKey: getGetLanguageBreakdownQueryKey() } });

  // Mock data for repo comparison
  const repoComparisonData = [
    { name: 'payment-service', quality: 92, security: 85, complexity: 78 },
    { name: 'auth-gateway', quality: 88, security: 94, complexity: 82 },
    { name: 'frontend-core', quality: 76, security: 88, complexity: 65 },
    { name: 'data-pipeline', quality: 85, security: 70, complexity: 90 },
    { name: 'mobile-app', quality: 80, security: 82, complexity: 75 },
  ];

  // Mock data for tech debt
  const techDebtData = Array.from({length: 12}).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    hours: 120 - (i * 5) + Math.floor(Math.random() * 20)
  }));

  const pieColors = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight font-mono flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            Executive Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Deep dive into codebase metrics and trends over time.</p>
        </motion.div>

        {/* Top KPIs */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 border-border/50 shadow-sm hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviews This Week</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-4xl font-bold font-mono text-foreground">{stats?.reviewsThisWeek || 0}</div>}
              <div className="flex items-center text-xs text-green-500 mt-2 bg-green-500/10 w-fit px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from last week
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50 shadow-sm hover:border-blue-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Files Analyzed</CardTitle>
              <Code className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-4xl font-bold font-mono text-foreground">{stats?.filesReviewed?.toLocaleString() || 0}</div>}
              <div className="flex items-center text-xs text-muted-foreground mt-2 bg-muted/50 w-fit px-2 py-0.5 rounded-full">
                Total historical
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50 shadow-sm hover:border-orange-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issues Found</CardTitle>
              <ShieldCheck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-4xl font-bold font-mono text-foreground">{stats?.issuesFound?.toLocaleString() || 0}</div>}
              <div className="flex items-center text-xs text-green-500 mt-2 bg-green-500/10 w-fit px-2 py-0.5 rounded-full">
                <ArrowDownRight className="h-3 w-3 mr-1" /> -4% detection rate
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50 shadow-sm hover:border-yellow-500/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Complexity</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono text-foreground">B+</div>
              <div className="flex items-center text-xs text-green-500 mt-2 bg-green-500/10 w-fit px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Improving trend
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Quality Trend */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="bg-card border-border/60 shadow-sm h-full">
              <CardHeader className="border-b border-border/50 bg-muted/5">
                <CardTitle className="text-lg">Quality vs Security Score History (30 Days)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  {trendLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => format(new Date(val), 'MMM d')} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 100]} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                          labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Area type="monotone" dataKey="qualityScore" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorQuality)" name="Code Quality" strokeWidth={2} activeDot={{ r: 6 }} />
                        <Area type="monotone" dataKey="securityScore" stroke="#ef4444" fillOpacity={1} fill="url(#colorSecurity)" name="Security Score" strokeWidth={2} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Language Distribution */}
          <motion.div variants={item}>
            <Card className="bg-card border-border/60 shadow-sm h-full">
              <CardHeader className="border-b border-border/50 bg-muted/5">
                <CardTitle className="text-lg">Language Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col justify-center">
                <div className="h-[300px] w-full mb-6">
                  {langLoading ? (
                    <Skeleton className="h-full w-full rounded-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languages}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="language"
                          stroke="none"
                        >
                          {languages?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        />
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {/* Repo Comparison */}
          <motion.div variants={item}>
            <Card className="bg-card border-border/60 shadow-sm h-full">
              <CardHeader className="border-b border-border/50 bg-muted/5">
                <CardTitle className="text-lg">Repository Comparison</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repoComparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="quality" name="Quality" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                      <Bar dataKey="security" name="Security" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                      <Bar dataKey="complexity" name="Complexity" fill="#eab308" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tech Debt Timeline */}
          <motion.div variants={item}>
            <Card className="bg-card border-border/60 shadow-sm h-full">
              <CardHeader className="border-b border-border/50 bg-muted/5">
                <CardTitle className="text-lg">Technical Debt Timeline (Estimated Hours)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={techDebtData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        formatter={(val) => [`${val} hrs`, 'Est. Remediation']}
                      />
                      <Line type="step" dataKey="hours" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
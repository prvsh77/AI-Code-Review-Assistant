import { AppLayout } from "@/components/layout/AppLayout";
import { useGetSecuritySummary, getGetSecuritySummaryQueryKey, useListSecurityIssues, getListSecurityIssuesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Shield, ShieldCheck, AlertTriangle, AlertCircle, Info, Lock } from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function Security() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  
  const { data: summary, isLoading: summaryLoading } = useGetSecuritySummary({ query: { queryKey: getGetSecuritySummaryQueryKey() } });
  
  // Note: the API expects specific enum values for severity if provided
  const queryParams = severityFilter !== "all" ? { severity: severityFilter as any } : {};
  const { data: issues, isLoading: issuesLoading } = useListSecurityIssues(queryParams, { query: { queryKey: getListSecurityIssuesQueryKey(queryParams) } });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "low": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "low": return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const donutData = summary ? [
    { name: 'Critical', value: summary.critical, color: 'hsl(0 84% 60%)' },
    { name: 'High', value: summary.high, color: 'hsl(24 94% 50%)' },
    { name: 'Medium', value: summary.medium, color: 'hsl(43 74% 66%)' },
    { name: 'Low', value: summary.low, color: 'hsl(215 90% 65%)' },
  ].filter(d => d.value > 0) : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            Security Issues
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and triage vulnerabilities across your repositories.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Total Issues</span>
              {summaryLoading ? <Skeleton className="h-8 w-12" /> : <span className="text-3xl font-bold">{summary?.total || 0}</span>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-red-500/20">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="h-5 w-5 text-red-500 mb-1" />
              <span className="text-sm font-medium text-red-500 mb-1">Critical</span>
              {summaryLoading ? <Skeleton className="h-8 w-12" /> : <span className="text-3xl font-bold text-red-500">{summary?.critical || 0}</span>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-orange-500/20">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mb-1" />
              <span className="text-sm font-medium text-orange-500 mb-1">High</span>
              {summaryLoading ? <Skeleton className="h-8 w-12" /> : <span className="text-3xl font-bold text-orange-500">{summary?.high || 0}</span>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-yellow-500/20">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mb-1" />
              <span className="text-sm font-medium text-yellow-500 mb-1">Medium</span>
              {summaryLoading ? <Skeleton className="h-8 w-12" /> : <span className="text-3xl font-bold text-yellow-500">{summary?.medium || 0}</span>}
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-blue-500/20">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Info className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-sm font-medium text-blue-500 mb-1">Low</span>
              {summaryLoading ? <Skeleton className="h-8 w-12" /> : <span className="text-3xl font-bold text-blue-500">{summary?.low || 0}</span>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Issues Table (span 2) */}
          <Card className="lg:col-span-2 bg-card border-border flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Vulnerabilities</CardTitle>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px] h-8 bg-background">
                  <SelectValue placeholder="Filter Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {issuesLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : issues && issues.length > 0 ? (
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead>Type & Description</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium text-foreground mb-1">{issue.type}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{issue.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono text-muted-foreground">{issue.filePath}</div>
                          <div className="text-xs text-primary font-mono mt-0.5">Line {issue.line}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getSeverityColor(issue.severity)} flex w-fit items-center gap-1.5 capitalize`}>
                            {getSeverityIcon(issue.severity)}
                            {issue.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{issue.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 text-green-500/50 mb-3" />
                  <p className="font-medium text-foreground">No issues found</p>
                  <p className="text-sm mt-1">Your code is secure or doesn't match the current filter.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donut Chart Sidebar (span 1) */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                {summaryLoading ? (
                  <Skeleton className="h-[250px] w-[250px] rounded-full" />
                ) : donutData.length > 0 ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '6px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                    No data to display
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">OWASP Top 10 Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mocked data for OWASP categories since it's not in the API directly */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">A01: Broken Access Control</span>
                      <span className="text-muted-foreground font-mono">3</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">A03: Injection</span>
                      <span className="text-muted-foreground font-mono">1</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">A05: Security Misconfiguration</span>
                      <span className="text-muted-foreground font-mono">5</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { useGetSecuritySummary, getGetSecuritySummaryQueryKey, useListSecurityIssues, getListSecurityIssuesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Shield, ShieldCheck, AlertTriangle, AlertCircle, Info, Lock, ArrowRight, ChevronRight, FileCode2, Code2 } from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { normalizeArray } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Security() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  
  const { data: summary, isLoading: summaryLoading } = useGetSecuritySummary({ query: { queryKey: getGetSecuritySummaryQueryKey() } });
  
  const queryParams = severityFilter !== "all" ? { severity: severityFilter as any } : {};
  const { data: issues, isLoading: issuesLoading } = useListSecurityIssues(queryParams, { query: { queryKey: getListSecurityIssuesQueryKey(queryParams) } });
  const issuesData = normalizeArray<any>(issues, "SecurityIssues");

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: <ShieldAlert className="h-4 w-4 text-red-500" /> };
      case "high": return { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: <AlertTriangle className="h-4 w-4 text-orange-500" /> };
      case "medium": return { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: <AlertCircle className="h-4 w-4 text-yellow-500" /> };
      case "low": return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: <Info className="h-4 w-4 text-blue-500" /> };
      default: return { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border", icon: <Shield className="h-4 w-4" /> };
    }
  };

  const donutData = summary ? [
    { name: 'Critical', value: summary.critical, color: '#ef4444' },
    { name: 'High', value: summary.high, color: '#f97316' },
    { name: 'Medium', value: summary.medium, color: '#eab308' },
    { name: 'Low', value: summary.low, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight font-mono flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            Security Posture
          </h1>
          <p className="text-muted-foreground mt-2">Monitor and triage vulnerabilities across your organization.</p>
        </motion.div>

        {/* Top Summary Cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card/40 border-border/50 shadow-sm hover:border-border transition-colors">
            <CardContent className="p-5 flex flex-col justify-center h-full">
              <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Total Issues
              </span>
              {summaryLoading ? <Skeleton className="h-8 w-16" /> : <span className="text-4xl font-bold font-mono">{summary?.total || 0}</span>}
            </CardContent>
          </Card>
          
          {[
            { label: "Critical", value: summary?.critical, color: "red", icon: ShieldAlert },
            { label: "High", value: summary?.high, color: "orange", icon: AlertTriangle },
            { label: "Medium", value: summary?.medium, color: "yellow", icon: AlertCircle },
            { label: "Low", value: summary?.low, color: "blue", icon: Info },
          ].map((stat, i) => (
            <Card key={i} className={`bg-card/40 border-${stat.color}-500/20 shadow-[0_0_15px_rgba(var(--${stat.color}-500),0.05)] hover:bg-${stat.color}-500/5 transition-colors relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 p-4 opacity-10 text-${stat.color}-500`}>
                <stat.icon className="h-16 w-16 -mr-4 -mt-4 transform rotate-12" />
              </div>
              <CardContent className="p-5 flex flex-col justify-center h-full relative z-10">
                <span className={`text-sm font-medium text-${stat.color}-500 mb-2 flex items-center gap-2`}>
                  <stat.icon className="h-4 w-4" /> {stat.label}
                </span>
                {summaryLoading ? <Skeleton className="h-8 w-16" /> : <span className={`text-4xl font-bold font-mono text-${stat.color}-500`}>{stat.value || 0}</span>}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Issues Table (span 2) */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="bg-card border-border/60 shadow-sm flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/5 border-b border-border/50">
                <div>
                  <CardTitle className="text-lg">Vulnerabilities</CardTitle>
                  <CardDescription>Prioritized list of security findings</CardDescription>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[160px] h-9 bg-background border-border/50">
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
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : issues && issues.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Type & Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issuesData.map((issue) => {
                        const style = getSeverityStyle(issue.severity);
                        const isExpanded = expandedIssue === issue.id;
                        
                        return (
                          <React.Fragment key={issue.id}>
                            <TableRow 
                              className={`border-border/50 hover:bg-muted/20 cursor-pointer transition-colors ${isExpanded ? 'bg-muted/10' : ''}`}
                              onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                            >
                              <TableCell className="pl-4">
                                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">{issue.type}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">{issue.description}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground">
                                  <FileCode2 className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[150px]" title={issue.filePath}>{issue.filePath.split('/').pop()}</span>
                                </div>
                                <div className="text-[11px] text-primary/80 font-mono mt-1">Line {issue.line}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${style.color} ${style.bg} ${style.border} flex w-fit items-center gap-1.5 capitalize font-medium text-[11px]`}>
                                  {style.icon}
                                  {issue.severity}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize bg-muted border-border/50 text-muted-foreground text-[10px] font-medium tracking-wider">
                                  {issue.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <AnimatePresence>
                              {isExpanded && (
                                <TableRow className="bg-muted/5 border-b border-border/50 hover:bg-muted/5">
                                  <TableCell colSpan={5} className="p-0">
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-6 grid grid-cols-3 gap-6">
                                        <div className="col-span-2 space-y-4">
                                          <div>
                                            <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{issue.description}</p>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                              <Code2 className="h-4 w-4 text-green-500" /> Suggested Fix
                                            </h4>
                                            <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 font-mono text-xs text-[#e6edf3] overflow-x-auto">
                                              <span className="text-[#ff7b72]">import</span> {"{ escape }"} <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'sql-template-strings'</span>;
                                              <br/><br/>
                                              <span className="text-[#8b949e] italic">// Change this:</span><br/>
                                              <span className="text-red-400 bg-red-900/20 line-through decoration-red-500/50">{"const query = `SELECT * FROM users WHERE id = ${id}`;"}</span><br/>
                                              <br/>
                                              <span className="text-[#8b949e] italic">// To this:</span><br/>
                                              <span className="text-green-400 bg-green-900/20">{"const query = SQL`SELECT * FROM users WHERE id = ${id}`;"}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="space-y-4 border-l border-border/50 pl-6">
                                          <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</h4>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Found in</span>
                                                <span className="font-mono text-foreground">PR #142</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">CWE</span>
                                                <span className="text-primary hover:underline cursor-pointer">CWE-89</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Introduced</span>
                                                <span>2 days ago</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="pt-4">
                                            <button className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
                                              Create Jira Issue <ArrowRight className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                      <ShieldCheck className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="font-medium text-foreground text-lg">No issues found</p>
                    <p className="text-sm mt-1 max-w-sm">Your codebase is secure or doesn't match the current severity filter.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebars (span 1) */}
          <motion.div variants={item} className="space-y-6">
            <Card className="bg-card border-border/60 shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/50">
                <CardTitle className="text-lg text-center">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center p-6">
                {summaryLoading ? (
                  <Skeleton className="h-[220px] w-[220px] rounded-full mx-auto" />
                ) : donutData.length > 0 ? (
                  <div className="h-[220px] w-full relative mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold font-mono">{summary?.total || 0}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Total</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[220px] w-full flex items-center justify-center text-muted-foreground">
                    No data to display
                  </div>
                )}
                
                <div className="space-y-2 mt-4">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-mono font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/50">
                <CardTitle className="text-lg">OWASP Top 10</CardTitle>
                <CardDescription>Mapping to standard categories</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">A01</span>
                        Broken Access
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">3 issues</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">A03</span>
                        Injection
                      </span>
                      <span className="text-red-500 font-mono text-xs">1 issue</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">A05</span>
                        Misconfiguration
                      </span>
                      <span className="text-yellow-500 font-mono text-xs">5 issues</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
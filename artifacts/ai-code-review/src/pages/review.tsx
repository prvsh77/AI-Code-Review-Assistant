import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReview, getGetReviewQueryKey, useGetReviewFiles, getGetReviewFilesQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, Zap, BookOpen, Code2, AlertTriangle, FileCode2, ArrowRight, 
  GitBranch, Clock, BrainCircuit, Share2, CheckCircle2, Coins, Server, Cpu
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ScoreRing } from "@/components/ui/score-ring";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { normalizeArray } from "@/lib/utils";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);

  const { data: review, isLoading: reviewLoading } = useGetReview(reviewId, { query: { queryKey: getGetReviewQueryKey(reviewId) } });
  const { data: files, isLoading: filesLoading } = useGetReviewFiles(reviewId, { query: { queryKey: getGetReviewFilesQueryKey(reviewId) } });
  const filesData = normalizeArray<any>(files, "ReviewFiles");

  const [activeTab, setActiveTab] = useState<"summary" | "telemetry" | "logs" | "prompts">("summary");
  const [selectedAgentLog, setSelectedAgentLog] = useState<string>("coordinator");
  const [selectedAgentPrompt, setSelectedAgentPrompt] = useState<string>("coordinator");

  const getLettergrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    return "D";
  };

  const gradeColor = (score: number) => {
    if (score >= 90) return "text-green-500 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]";
    if (score >= 80) return "text-primary border-primary shadow-[0_0_30px_rgba(0,188,212,0.2)]";
    if (score >= 70) return "text-yellow-500 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]";
    return "text-destructive border-destructive shadow-[0_0_30px_rgba(239,68,68,0.2)]";
  };

  // Safe parsing of top issues array
  const topIssuesData = (() => {
    if (!review?.topIssues) return [];
    if (Array.isArray(review.topIssues)) return review.topIssues;
    try {
      if (typeof review.topIssues === "string") {
        return JSON.parse(review.topIssues);
      }
    } catch {}
    return [];
  })();

  // Parse prompt templates and agent outputs
  const agentOutputsData = (() => {
    if (!review?.agentOutputs) return null;
    if (typeof review.agentOutputs === "object") return review.agentOutputs;
    try {
      return JSON.parse(review.agentOutputs);
    } catch {}
    return null;
  })();

  const promptTemplatesData = (() => {
    if (!review?.promptTemplates) return null;
    if (typeof review.promptTemplates === "object") return review.promptTemplates;
    try {
      return JSON.parse(review.promptTemplates);
    } catch {}
    return null;
  })();

  // Calculate issue distribution counts
  const criticalCount = topIssuesData.filter((i: any) => i.severity === "critical" || i.severity === "high").length;
  const mediumCount = topIssuesData.filter((i: any) => i.severity === "medium").length;
  const lowCount = topIssuesData.filter((i: any) => i.severity === "low" || i.severity === "info").length;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
        {/* Top Header Section */}
        <motion.div variants={item} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-border/50">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Repositories</span>
              <span>/</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">{review?.repositoryName || "..."}</span>
              <span>/</span>
              <span className="font-mono text-primary">PR #{review?.pullRequestNumber || "..."}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {reviewLoading ? <Skeleton className="h-10 w-96" /> : `Code Review for PR #${review?.pullRequestNumber}`}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {review?.author?.substring(0, 2).toUpperCase() || "GH"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{review?.author || "Author"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{review?.reviewedAt ? format(new Date(review.reviewedAt), 'MMM d, yyyy') : "..."}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary/80">
                <Zap className="h-3.5 w-3.5" />
                <span>Reviewed in {(((review?.latencyMs || 0) / 1000)).toFixed(1)}s</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <Link href={`/review/${reviewId}/code`} className="flex-1 lg:flex-none">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-[0_0_20px_rgba(0,188,212,0.2)]">
                <Code2 className="mr-2 h-4 w-4" /> View Reviewed Code
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Score Overview Bar */}
        <motion.div variants={item} className="bg-card/40 border border-border/50 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-8">
              <ScoreRing score={Number(review?.qualityScore || 0)} size="md" label="Code Quality" />
              <ScoreRing score={Number(review?.securityScore || 0)} size="md" label="Security" />
              <ScoreRing score={Number(review?.complexityScore || 0)} size="md" label="Complexity" />
              <ScoreRing score={Number(review?.documentationScore || 0)} size="md" label="Documentation" />
            </div>
            
            <div className="h-px w-full md:w-px md:h-32 bg-border/50" />
            
            <div className="flex flex-col items-center justify-center shrink-0 w-48">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Overall Grade</span>
              {reviewLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center bg-card ${gradeColor(Number(review?.qualityScore || 0))}`}>
                  <span className="text-5xl font-black">{getLettergrade(Number(review?.qualityScore || 0))}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={item}>
              <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
                <div className="flex border-b border-border/50 bg-muted/10">
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === "summary"
                        ? "border-primary text-primary bg-background/50"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BrainCircuit className="h-4 w-4" />
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("telemetry")}
                    className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === "telemetry"
                        ? "border-primary text-primary bg-background/50"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Server className="h-4 w-4" />
                    LLM Telemetry
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === "logs"
                        ? "border-primary text-primary bg-background/50"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Cpu className="h-4 w-4" />
                    Agent Logs
                  </button>
                  <button
                    onClick={() => setActiveTab("prompts")}
                    className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === "prompts"
                        ? "border-primary text-primary bg-background/50"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Code2 className="h-4 w-4" />
                    Prompt Templates
                  </button>
                </div>

                <CardContent className="p-6">
                  {reviewLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : activeTab === "summary" ? (
                    <div>
                      <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-[15px] whitespace-pre-wrap">
                        {review?.aiSummary || "No review summary generated."}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-border/50 flex gap-4 overflow-x-auto pb-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          Critical ({criticalCount})
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          Medium ({mediumCount})
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Low ({lowCount})
                        </Badge>
                      </div>
                    </div>
                  ) : activeTab === "telemetry" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Execution Statistics</h3>
                        <div className="space-y-3 font-mono text-sm">
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">AI Provider Model</span>
                            <span className="text-primary font-bold">{review?.modelUsed || "gpt-4o"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Prompt (Input) Tokens</span>
                            <span>{review?.inputTokens?.toLocaleString() || "0"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Completion (Output) Tokens</span>
                            <span>{review?.outputTokens?.toLocaleString() || "0"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/20">
                            <span className="text-muted-foreground">Overall Duration</span>
                            <span>{review?.latencyMs ? `${(review.latencyMs / 1000).toFixed(2)}s` : "0s"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Financial Telemetry</h3>
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col justify-between h-[120px]">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Estimated API Cost</span>
                            <Coins className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-4xl font-extrabold font-mono text-primary">
                            ${review?.cost ? Number(review.cost).toFixed(6) : "0.000000"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Computed dynamically using real token counts and pricing rules</span>
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "logs" ? (
                    <div className="space-y-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/30">
                        {["coordinator", "reviewer", "security", "complexity", "documentation", "refactoring"].map((agentName) => (
                          <button
                            key={agentName}
                            onClick={() => setSelectedAgentLog(agentName)}
                            className={`px-3 py-1 text-xs rounded-full border transition-all font-mono capitalize shrink-0 ${
                              selectedAgentLog === agentName
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                            }`}
                          >
                            {agentName}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        {agentOutputsData ? (
                          (() => {
                            // Extract selected agent logs
                            let logObject = null;
                            if (selectedAgentLog === "coordinator") {
                              logObject = agentOutputsData.coordinator || agentOutputsData[0]?.logs?.coordinator || {};
                            } else {
                              // If data is in array of files (multi-file logs)
                              if (Array.isArray(agentOutputsData)) {
                                logObject = agentOutputsData.map((f: any) => ({
                                  file: f.filePath,
                                  logs: f.logs?.[selectedAgentLog] || {}
                                }));
                              } else {
                                logObject = agentOutputsData[selectedAgentLog] || {};
                              }
                            }

                            return (
                              <pre className="bg-[#0d1117] text-[#e6edf3] p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] border border-border shadow-inner whitespace-pre-wrap select-text">
                                {JSON.stringify(logObject, null, 2)}
                              </pre>
                            );
                          })()
                        ) : (
                          <div className="p-8 text-center text-sm text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed border-border">
                            No raw agent logs saved for this review session.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/30">
                        {["coordinator", "reviewer", "security", "complexity", "documentation", "refactoring"].map((agentName) => (
                          <button
                            key={agentName}
                            onClick={() => setSelectedAgentPrompt(agentName)}
                            className={`px-3 py-1 text-xs rounded-full border transition-all font-mono capitalize shrink-0 ${
                              selectedAgentPrompt === agentName
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                            }`}
                          >
                            {agentName}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        {promptTemplatesData && promptTemplatesData[selectedAgentPrompt] ? (
                          <pre className="bg-[#0d1117] text-[#e6edf3] p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] border border-border shadow-inner whitespace-pre-wrap select-text">
                            {promptTemplatesData[selectedAgentPrompt]}
                          </pre>
                        ) : (
                          <div className="p-8 text-center text-sm text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed border-border">
                            Prompt template unavailable or not logged for this provider session.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Files List Card */}
            <motion.div variants={item}>
              <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg">Files Changed</CardTitle>
                    <CardDescription>Click a file to view detailed inline comments</CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono">{filesData.length} files</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {filesLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/5">
                        <TableRow className="border-border/50">
                          <TableHead className="pl-6 w-[60%]">File</TableHead>
                          <TableHead className="w-[20%]">Changes</TableHead>
                          <TableHead className="text-right pr-6 w-[20%]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filesData.map((file) => (
                          <TableRow key={file.id} className="border-border/50 hover:bg-muted/20 group transition-colors">
                            <TableCell className="pl-6 font-mono text-sm">
                              <div className="flex items-center gap-3">
                                <FileCode2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors animate-pulse" />
                                <span className="truncate">{file.filePath}</span>
                                {file.status === "added" && <Badge variant="outline" className="ml-2 text-green-500 border-green-500/20 bg-green-500/10 text-[10px] uppercase px-1 py-0 h-4">New</Badge>}
                                {file.status === "deleted" && <Badge variant="outline" className="ml-2 text-red-500 border-red-500/20 bg-red-500/10 text-[10px] uppercase px-1 py-0 h-4">Del</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-3 text-xs font-mono">
                                <span className="text-green-500 font-medium">+{file.additions}</span>
                                <span className="text-destructive font-medium">-{file.deletions}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Link href={`/review/${reviewId}/code?file=${encodeURIComponent(file.filePath)}`}>
                                <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-8 text-xs">
                                  View File <ArrowRight className="ml-1.5 h-3 w-3" />
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
            </motion.div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-8">
            <motion.div variants={item}>
              <Card className="bg-card border-border/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <CardHeader className="bg-red-500/5 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    Top Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {reviewLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topIssuesData.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground italic py-6">
                          No critical/high severity security or quality issues detected by the agents.
                        </div>
                      ) : (
                        topIssuesData.map((issue: any, index: number) => {
                          const isHigh = issue.severity === "critical" || issue.severity === "high";
                          const isMedium = issue.severity === "medium";
                          return (
                            <div 
                              key={index}
                              className={`group rounded-md border bg-background p-3 transition-colors ${
                                isHigh ? "hover:border-red-500/50 border-border/50" : isMedium ? "hover:border-yellow-500/50 border-border/50" : "hover:border-blue-500/50 border-border/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`h-2 w-2 rounded-full ${isHigh ? "bg-red-500" : isMedium ? "bg-yellow-500" : "bg-blue-500"}`} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${isHigh ? "text-red-500" : isMedium ? "text-yellow-500" : "text-blue-500"}`}>
                                  {issue.severity}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto font-mono truncate max-w-[150px]">
                                  {issue.filePath?.split('/').pop()}:{issue.line}
                                </span>
                              </div>
                              <p className="text-sm text-foreground leading-snug">{issue.description}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" /> Security Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Donut Chart */}
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${Math.max(1, criticalCount) * 25} 251.2`} strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${Math.max(1, mediumCount) * 25} 251.2`} strokeDashoffset={`-${Math.max(1, criticalCount) * 25}`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold">{topIssuesData.length}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Issues</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <span className="text-foreground">Critical/High Issues</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{criticalCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                        <span className="text-foreground">Medium Complexity</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{mediumCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <span className="text-foreground">Low Severity</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{lowCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
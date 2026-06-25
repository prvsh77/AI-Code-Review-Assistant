import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReview, getGetReviewQueryKey, useGetReviewFiles, getGetReviewFilesQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Zap, BookOpen, Code2, AlertTriangle, FileCode2, ArrowRight, GitBranch, Clock, BrainCircuit, Share2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ScoreRing } from "@/components/ui/score-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
              {reviewLoading ? <Skeleton className="h-10 w-96" /> : "Implement Stripe payment retry webhook"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{review?.author?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{review?.author || "Author"}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/30 border border-border/50">
                <GitBranch className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">feat/payment-retry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{review?.reviewedAt ? format(new Date(review.reviewedAt), 'MMM d, yyyy') : "..."}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary/80">
                <Zap className="h-3.5 w-3.5" />
                <span>Reviewed in 2.3 min</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <Button variant="outline" className="flex-1 lg:flex-none border-border hover:bg-muted/50 font-medium">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Link href={`/review/${reviewId}/code`} className="flex-1 lg:flex-none">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-[0_0_20px_rgba(0,188,212,0.2)]">
                <Code2 className="mr-2 h-4 w-4" /> View Full Diff
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Score Overview Bar */}
        <motion.div variants={item} className="bg-card/40 border border-border/50 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-8">
              <ScoreRing score={review?.qualityScore || 0} size="md" label="Code Quality" />
              <ScoreRing score={review?.securityScore || 0} size="md" label="Security" />
              <ScoreRing score={review?.complexityScore || 0} size="md" label="Complexity" />
              <ScoreRing score={review?.documentationScore || 0} size="md" label="Documentation" />
            </div>
            
            <div className="h-px w-full md:w-px md:h-32 bg-border/50" />
            
            <div className="flex flex-col items-center justify-center shrink-0 w-48">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Overall Grade</span>
              {reviewLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center bg-card ${gradeColor(review?.qualityScore || 0)}`}>
                  <span className="text-5xl font-black">{getLettergrade(review?.qualityScore || 0)}</span>
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
                <CardHeader className="bg-muted/10 border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {reviewLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed text-[15px]">
                        This PR implements the requested Stripe webhook retry logic. The overall approach is solid, utilizing exponential backoff correctly. 
                        However, there is a critical <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-mono text-sm border border-red-500/20">SQL injection</span> vulnerability in the way failed events are logged to the database. 
                        Additionally, several new functions are <span className="text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded font-mono text-sm border border-yellow-500/20">missing error handling</span> for edge cases. 
                        I recommend fixing the security issue immediately before proceeding.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-border/50 flex gap-4 overflow-x-auto pb-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium whitespace-nowrap hover:bg-red-500/20 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Critical (1)
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium whitespace-nowrap hover:bg-orange-500/20 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      High (2)
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium whitespace-nowrap hover:bg-yellow-500/20 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Medium (1)
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/50 text-muted-foreground text-sm font-medium whitespace-nowrap opacity-50 cursor-not-allowed">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      Low (0)
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg">Files Changed</CardTitle>
                    <CardDescription>Click a file to view detailed inline comments</CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono">{files?.length || 0} files</Badge>
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
                        {files?.map((file) => (
                          <TableRow key={file.id} className="border-border/50 hover:bg-muted/20 group transition-colors">
                            <TableCell className="pl-6 font-mono text-sm">
                              <div className="flex items-center gap-3">
                                <FileCode2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
                      <div className="group rounded-md border border-border/50 bg-background p-3 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-red-500">Critical</span>
                          <span className="text-xs text-muted-foreground ml-auto font-mono">src/api/webhooks.ts:42</span>
                        </div>
                        <p className="text-sm text-foreground">SQL Injection vulnerability in direct string concatenation for DB insert.</p>
                      </div>
                      
                      <div className="group rounded-md border border-border/50 bg-background p-3 hover:border-orange-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-500">High</span>
                          <span className="text-xs text-muted-foreground ml-auto font-mono">src/utils/retry.ts:18</span>
                        </div>
                        <p className="text-sm text-foreground">Missing exponential backoff jitter, could cause thundering herd.</p>
                      </div>
                      
                      <div className="group rounded-md border border-border/50 bg-background p-3 hover:border-orange-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-500">High</span>
                          <span className="text-xs text-muted-foreground ml-auto font-mono">src/api/webhooks.ts:88</span>
                        </div>
                        <p className="text-sm text-foreground">Unhandled promise rejection in async event handler.</p>
                      </div>
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
                  {/* Mock Donut Chart */}
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${25 * 2.5} 251.2`} strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="12" strokeDasharray={`${50 * 2.5} 251.2`} strokeDashoffset={`-${25 * 2.5}`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold">3</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Issues</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <span className="text-foreground">Injection</span>
                      </div>
                      <span className="font-mono text-muted-foreground">1</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-orange-500" />
                        <span className="text-foreground">Error Handling</span>
                      </div>
                      <span className="font-mono text-muted-foreground">2</span>
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
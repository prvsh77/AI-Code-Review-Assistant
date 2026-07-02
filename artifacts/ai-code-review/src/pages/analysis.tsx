import { AppLayout } from "@/components/layout/AppLayout";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, Code2, ShieldAlert, Zap, BookOpen, ArrowRight, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGetReviewJob, getGetReviewJobQueryKey } from "@workspace/api-client-react";

const agents = [
  { name: "Code Quality Agent", id: "quality", icon: Code2, task: "Analyzing logic patterns and style..." },
  { name: "Security Agent", id: "security", icon: ShieldAlert, task: "Scanning files for vulnerabilities..." },
  { name: "Complexity Agent", id: "complexity", icon: Zap, task: "Calculating cyclomatic complexity..." },
  { name: "Documentation Agent", id: "documentation", icon: BookOpen, task: "Generating summaries..." }
];

export default function Analysis() {
  const { jobId } = useParams<{ jobId: string }>();
  const [elapsed, setElapsed] = useState(0);

  // Poll the job status every 1 second while it is "analyzing"
  const { data: job, isLoading, isError } = useGetReviewJob(jobId, {
    query: {
      queryKey: getGetReviewJobQueryKey(jobId),
      refetchInterval: (query) => {
        const data = query.state.data as any;
        if (!data || data.status === "analyzing") {
          return 1000;
        }
        return false;
      }
    }
  });

  const progress = job?.progress ?? 0;
  const completed = job?.status === "completed";
  const failed = job?.status === "failed";

  useEffect(() => {
    if (completed || failed) return;
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [completed, failed]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${m}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[80vh]"
      >
        <div className="w-full max-w-3xl space-y-12">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                <circle cx="60" cy="60" r="54" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="6" />
                <motion.circle 
                  cx="60" cy="60" r="54" 
                  fill="transparent" 
                  stroke={completed ? "#22c55e" : "hsl(var(--primary))"} 
                  strokeWidth="6" 
                  strokeDasharray={54 * 2 * Math.PI}
                  strokeDashoffset={(54 * 2 * Math.PI) - (progress / 100) * (54 * 2 * Math.PI)}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {completed ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </motion.div>
                ) : failed ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                    <XCircle className="h-10 w-10 text-red-500" />
                  </motion.div>
                ) : (
                  <>
                    <span className="text-2xl font-bold font-mono tracking-tighter text-primary">{Math.floor(progress)}%</span>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground flex items-center justify-center gap-2">
                {completed ? "Analysis Complete" : failed ? "Analysis Failed" : "Analyzing Pull Request"}
                {!completed && !failed && (
                  <motion.span 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-3 h-6 bg-primary"
                  />
                )}
              </h1>
              <div className="text-muted-foreground mt-2 font-mono text-sm flex items-center justify-center gap-4">
                <span>Job ID: {jobId}</span>
                <span>•</span>
                <span>Elapsed: {formatTime(elapsed)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* SVG Connecting lines (visible on desktop) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block -z-10" style={{ zIndex: -1 }}>
              <motion.line 
                x1="25%" y1="50%" x2="75%" y2="50%" 
                stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" 
              />
              <motion.line 
                x1="50%" y1="25%" x2="50%" y2="75%" 
                stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" 
              />
              
              {/* Animated active paths */}
              <motion.line 
                x1="25%" y1="50%" x2="75%" y2="50%" 
                stroke="hsl(var(--primary))" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress > 50 ? 1 : progress / 50 }}
                className={progress < 50 ? "opacity-100" : "opacity-0"}
              />
            </svg>

            {failed ? (
              <div className="col-span-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-5 flex items-start gap-4">
                <XCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base mb-1">Analysis Failed</h3>
                  <p className="opacity-90">{job?.error || "An unexpected error occurred during the multi-agent review."}</p>
                  <Link href="/repositories">
                    <Button variant="outline" className="mt-4 border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-400">
                      Back to Repositories
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              agents.map((agent, index) => {
                const backendAgent = job?.agents?.find(
                  (a) => a.name.toLowerCase().includes(agent.id) || a.name.toLowerCase().includes(agent.name.split(" ")[0].toLowerCase())
                );
                
                const status = completed ? "completed" : (backendAgent?.status || "waiting");
                const AgentIcon = agent.icon;
                const agentProgress = status === "completed" ? 100 : status === "running" ? (backendAgent?.progress || 50) : 0;

                return (
                  <motion.div 
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-2 transition-all duration-300 ${
                      status === "running" ? "border-primary shadow-[0_0_15px_rgba(0,188,212,0.2)] bg-card" : 
                      status === "completed" ? "border-green-500/50 bg-card/50" : 
                      status === "failed" ? "border-red-500/50 bg-card/50" :
                      "border-border bg-card/30 opacity-60"
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            status === "running" ? "bg-primary/20 text-primary" :
                            status === "completed" ? "bg-green-500/20 text-green-500" :
                            status === "failed" ? "bg-red-500/20 text-red-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            <AgentIcon className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-semibold text-sm ${status === "waiting" ? "text-muted-foreground" : "text-foreground"}`}>
                                {agent.name}
                              </h3>
                              {status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              {status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                              {status === "running" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                            </div>
                            
                            <p className="text-xs text-muted-foreground truncate mb-3">
                              {status === "completed" ? "Analysis complete." :
                               status === "failed" ? "Analysis failed." :
                               status === "running" ? agent.task : "Waiting for dependencies..."}
                            </p>
                            
                            <div className="flex items-center gap-3">
                              <Progress value={agentProgress} className={`h-1.5 flex-1 ${
                                status === "completed" ? "[&>div]:bg-green-500" : status === "failed" ? "[&>div]:bg-red-500" : ""
                              }`} />
                              <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                                {Math.floor(agentProgress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {completed && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
              className="flex justify-center mt-8"
            >
              <Link href={`/review/${job?.reviewId}`}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 shadow-[0_0_30px_rgba(0,188,212,0.3)] hover:scale-105 transition-transform">
                  View Full Report
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
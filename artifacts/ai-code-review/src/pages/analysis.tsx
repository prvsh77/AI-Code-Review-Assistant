import { AppLayout } from "@/components/layout/AppLayout";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

// Mock data since there's no endpoint to poll job status yet
const agents = [
  { name: "Reviewer Agent", id: "reviewer" },
  { name: "Security Agent", id: "security" },
  { name: "Complexity Agent", id: "complexity" },
  { name: "Documentation Agent", id: "documentation" }
];

export default function Analysis() {
  const { jobId } = useParams<{ jobId: string }>();
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setCompleted(true);
          return 100;
        }
        
        const newProgress = prev + 5;
        setCurrentAgent(Math.min(Math.floor(newProgress / 25), 3));
        return newProgress;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [jobId]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">
              {completed ? "Analysis Complete" : "Analyzing Codebase"}
            </h1>
            <p className="text-muted-foreground font-mono">Job ID: {jobId}</p>
          </div>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-8">
              <Progress value={progress} className="h-3 mb-8 bg-muted" />

              <div className="space-y-6">
                {agents.map((agent, index) => {
                  const status = 
                    completed ? "completed" :
                    index < currentAgent ? "completed" :
                    index === currentAgent ? "running" : "waiting";

                  return (
                    <div key={agent.id} className="flex items-center gap-4">
                      {status === "completed" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                      {status === "running" && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
                      {status === "waiting" && <Circle className="h-6 w-6 text-muted-foreground" />}
                      
                      <div className="flex-1">
                        <div className={`font-medium ${status === "waiting" ? "text-muted-foreground" : "text-foreground"}`}>
                          {agent.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {status === "completed" ? "Checks passed" :
                           status === "running" ? "Analyzing files..." : "Waiting to start"}
                        </div>
                      </div>
                      
                      <div className="text-sm font-mono text-muted-foreground">
                        {status === "completed" ? "100%" :
                         status === "running" ? `${(progress % 25) * 4}%` : "0%"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {completed && (
                <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4">
                  <Link href={`/review/1`}>
                    <Button size="lg" className="w-full sm:w-auto font-medium">
                      View Review Report
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

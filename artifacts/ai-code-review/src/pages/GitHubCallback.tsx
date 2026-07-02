import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGithubAuth } from "@workspace/api-client-react";
import { tokenStore } from "@/lib/tokenStore";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GitHubCallback() {
  const [_, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const githubAuthMutation = useGithubAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setError("No authorization code received from GitHub.");
      return;
    }

    githubAuthMutation.mutate(
      {
        data: {
          code,
          redirectUri: `${window.location.origin}/auth/github/callback`,
        },
      },
      {
        onSuccess: (data) => {
          tokenStore.setToken(data.token);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          setError(
            err.data?.error || err.data?.detail || "GitHub authentication exchange failed."
          );
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground font-sans px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        {error ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Authentication Failed</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
              onClick={() => setLocation("/login")}
            >
              Back to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary tracking-widest font-mono">GH</span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight font-mono">Connecting with GitHub</h1>
              <p className="text-muted-foreground text-sm">
                Exchanging authentication tokens and synchronizing repositories...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

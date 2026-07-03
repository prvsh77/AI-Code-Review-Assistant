import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function GitHubEmptyState() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(
        `${API_URL}/api/auth/github/url?origin=${encodeURIComponent(window.location.origin)}`
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to get GitHub authorize URL.");
        setConnecting(false);
      }
    } catch (err) {
      alert("Failed to connect to API server.");
      setConnecting(false);
    }
  };

  const benefits = [
    "View repositories",
    "Analyze pull requests",
    "View language statistics",
    "Trigger AI reviews",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto my-8"
    >
      <Card className="bg-card/40 backdrop-blur-md border-border/60 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
        <CardContent className="p-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-muted/60 border border-border/80 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Github className="h-8 w-8 text-foreground" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono mb-2">
            GitHub not connected
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Connect your GitHub account to enable full workspace analytics and AI code reviews.
          </p>

          <div className="w-full max-w-xs text-left bg-muted/20 border border-border/40 rounded-xl p-5 mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Connect your GitHub account to:
            </p>
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-[0_0_15px_rgba(0,188,212,0.3)] hover:shadow-[0_0_25px_rgba(0,188,212,0.5)] font-semibold h-12"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-5 w-5" />
                Connect GitHub
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

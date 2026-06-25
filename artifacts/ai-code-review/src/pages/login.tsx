import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalSquare } from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-8 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2 text-primary mb-8">
          <TerminalSquare className="h-10 w-10" />
          <span className="font-bold text-2xl tracking-tight font-mono">AI Code Review</span>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground mb-8">Sign in to continue to your dashboard</p>

        <Link href="/dashboard" className="w-full">
          <Button className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-lg font-medium">
            <SiGithub className="mr-3 h-5 w-5" />
            Continue with GitHub
          </Button>
        </Link>

        <p className="mt-8 text-sm text-muted-foreground">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

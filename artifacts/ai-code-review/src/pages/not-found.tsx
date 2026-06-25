import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalSquare, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md flex flex-col items-center">
        <TerminalSquare className="h-24 w-24 text-primary/50 animate-pulse" />
        <h1 className="text-8xl font-bold font-mono tracking-tighter text-primary">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground">
          The code you are looking for has been refactored, deleted, or never existed in the first place.
        </p>
        <Link href="/">
          <Button className="mt-4" size="lg">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

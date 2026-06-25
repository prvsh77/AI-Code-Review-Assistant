import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalSquare, ChevronRight, Shield, Zap, BookOpen, Code2 } from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <TerminalSquare className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight font-mono">AI Code Review</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            AI-Powered Code Review for <span className="text-primary">Elite Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Automate code quality, security, complexity, and documentation checks with precision. Ship faster and safer.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto">
                <SiGithub className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto border-border hover:bg-muted">
                View Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-card/30">
          <div className="container mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card border border-border p-6 rounded-lg">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Security First</h3>
                <p className="text-muted-foreground">Detect vulnerabilities and misconfigurations before they reach production.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-lg">
                <Zap className="h-10 w-10 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Performance & Complexity</h3>
                <p className="text-muted-foreground">Identify bottlenecks and overly complex logic to keep your codebase maintainable.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-lg">
                <BookOpen className="h-10 w-10 text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Automated Documentation</h3>
                <p className="text-muted-foreground">Generate comprehensive documentation for your APIs and complex functions automatically.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-lg">
                <Code2 className="h-10 w-10 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Style & Consistency</h3>
                <p className="text-muted-foreground">Enforce coding standards and best practices consistently across your entire team.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-muted-foreground">
        <p>© 2026 AI Code Review. All rights reserved.</p>
      </footer>
    </div>
  );
}

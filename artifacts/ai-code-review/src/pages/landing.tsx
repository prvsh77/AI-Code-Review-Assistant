import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalSquare, ChevronRight, Shield, Zap, BookOpen, Code2, Play, Users, GitPullRequest } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { motion } from "framer-motion";

export default function Landing() {
  const features = [
    {
      icon: <CheckSquare className="h-6 w-6 text-cyan-400" />,
      title: "AI Review Agent",
      description: "Automated, contextual code reviews that understand your entire codebase architecture, not just the diff.",
      colSpan: "md:col-span-2",
    },
    {
      icon: <Shield className="h-6 w-6 text-red-400" />,
      title: "Security Scanning",
      description: "Catch zero-days, hardcoded secrets, and OWASP Top 10 vulnerabilities before they merge.",
      colSpan: "md:col-span-1",
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Complexity Analysis",
      description: "Identify technical debt and overly complex logic proactively.",
      colSpan: "md:col-span-1",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-400" />,
      title: "Auto Documentation",
      description: "Generate comprehensive PR summaries and code comments.",
      colSpan: "md:col-span-1",
    },
    {
      icon: <GitPullRequest className="h-6 w-6 text-purple-400" />,
      title: "Performance Insights",
      description: "Highlight inefficient loops and memory leaks.",
      colSpan: "md:col-span-1",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Team Collaboration",
      description: "Align team coding standards and enforce best practices consistently across repositories.",
      colSpan: "md:col-span-2",
    },
  ];

  const steps = [
    { num: "01", title: "Connect GitHub", desc: "One-click OAuth integration. No complicated setup.", icon: <SiGithub className="h-5 w-5" /> },
    { num: "02", title: "Select PR", desc: "Webhooks automatically trigger on new pull requests.", icon: <GitPullRequest className="h-5 w-5" /> },
    { num: "03", title: "AI Analyzes", desc: "Multi-agent system reviews for quality, security & bugs.", icon: <TerminalSquare className="h-5 w-5" /> },
    { num: "04", title: "View Report", desc: "Get actionable inline comments and an executive summary.", icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-2 text-primary">
          <TerminalSquare className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight font-mono">AI Code Review</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">Log In</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(0,188,212,0.2)]">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now in Public Beta
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
                AI-Powered Code Review <br className="hidden md:block" />
                for <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Modern Teams</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Review pull requests 10x faster with multi-agent AI analysis. Catch bugs, security vulnerabilities, and performance issues automatically before they merge.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 w-full sm:w-auto shadow-[0_0_30px_rgba(0,188,212,0.3)]">
                    <SiGithub className="mr-2 h-5 w-5" />
                    Start Free with GitHub
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="text-lg px-8 h-14 w-full sm:w-auto border-border hover:bg-muted/50">
                    <Play className="mr-2 h-5 w-5" />
                    View Live Demo
                  </Button>
                </Link>
              </div>
              
              <div className="mt-20 pt-10 border-t border-border/50 max-w-3xl mx-auto">
                <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">Trusted by engineers at</p>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <span className="text-xl font-bold font-sans">Google</span>
                  <span className="text-xl font-bold font-sans">Microsoft</span>
                  <span className="text-xl font-bold font-sans">Stripe</span>
                  <span className="text-xl font-bold font-sans tracking-tight">NETFLIX</span>
                  <span className="text-xl font-bold font-mono">GitHub</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24 bg-card/30 border-y border-border/50 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Complete Code Intelligence</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A specialized AI agent for every aspect of your codebase.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors relative overflow-hidden group ${feature.colSpan}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="bg-background/50 border border-border/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Seamless integration into your existing workflow.</p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-start gap-8 max-w-6xl mx-auto relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border z-0">
                <div className="absolute top-0 left-0 h-full bg-primary animate-[pulse_3s_ease-in-out_infinite]" style={{ width: '100%' }} />
              </div>
              
              {steps.map((step, i) => (
                <div key={i} className="flex-1 relative z-10 flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-card border-2 border-border group-hover:border-primary transition-colors rounded-2xl flex items-center justify-center mb-6 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/20 transition-colors" />
                    <div className="text-muted-foreground group-hover:text-primary transition-colors scale-150">
                      {step.icon}
                    </div>
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-muted-foreground/50">{step.num}</div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-card/30 border-t border-border/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Start free, upgrade when you need more power.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-muted-foreground mb-6">Perfect for individuals.</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Up to 5 public repos</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Basic AI review agent</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Community support</li>
                </ul>
                <Button variant="outline" className="w-full border-border hover:bg-muted/50">Get Started</Button>
              </div>
              
              {/* Pro */}
              <div className="bg-card border-2 border-primary rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(0,188,212,0.15)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-muted-foreground mb-6">For professional teams.</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">$29</span>
                  <span className="text-muted-foreground">/mo per user</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Unlimited private repos</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> All specialized AI agents</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Security & complexity scanning</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Priority support</li>
                </ul>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Start Free Trial</Button>
              </div>
              
              {/* Enterprise */}
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-muted-foreground mb-6">For large organizations.</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">Custom</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Custom LLM deployments</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Single Sign-On (SSO)</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Custom rule enforcement</li>
                  <li className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-green-500" /> Dedicated account manager</li>
                </ul>
                <Button variant="outline" className="w-full border-border hover:bg-muted/50">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TerminalSquare className="h-6 w-6" />
            <span className="font-bold tracking-tight font-mono">AI Code Review</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 AI Code Review. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Dummy CheckSquare since it was missing import
function CheckSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

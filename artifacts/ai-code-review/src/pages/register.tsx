import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminalSquare, ArrowRight, Loader2, AlertCircle, Check, X } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRegister } from "@workspace/api-client-react";
import { tokenStore } from "@/lib/tokenStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [_, setLocation] = useLocation();
  const registerMutation = useRegister();

  // Password requirements
  const [hasMinLen, setHasMinLen] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNum, setHasNum] = useState(false);

  useEffect(() => {
    setHasMinLen(password.length >= 8);
    setHasUpper(/[A-Z]/.test(password));
    setHasLower(/[a-z]/.test(password));
    setHasNum(/[0-9]/.test(password));
  }, [password]);

  const isPasswordStrong = hasMinLen && hasUpper && hasLower && hasNum;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong) {
      setError("Please fulfill all password requirements.");
      return;
    }

    registerMutation.mutate({
      data: {
        name,
        email,
        password,
      }
    }, {
      onSuccess: (data) => {
        tokenStore.setToken(data.token);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        setError(err.data?.error || "Registration failed. Email might already be taken.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-card relative overflow-hidden flex-col justify-between p-12 border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-primary mb-12 w-max">
            <TerminalSquare className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight font-mono">AI Code Review</span>
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4 text-white">
            Automate code quality checks in seconds.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Integrate with GitHub, configure your analysis rules, and receive instant reviews on every pull request.
          </p>
        </div>

        {/* Decorative Quote */}
        <div className="relative z-10 p-6 bg-background/30 rounded-xl border border-border/40 backdrop-blur-sm max-w-lg mb-12">
          <p className="text-sm font-mono text-muted-foreground italic">
            "Adding the automated AI reviews to our pipeline reduced code review cycle times by 42% and caught two authentication bypass vulnerabilities before releasing to production."
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="text-xs font-semibold text-white">Lead QA Engineer</div>
            <div className="text-xs text-muted-foreground">• TechCorp Solutions</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto">
        <div className="absolute top-8 right-8 flex lg:hidden items-center gap-2 text-primary">
          <TerminalSquare className="h-6 w-6" />
          <span className="font-bold tracking-tight font-mono">AI Code Review</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8 py-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Create your account</h2>
            <p className="text-muted-foreground">Start shipping production-ready code today</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3.5 flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <Input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe" 
                  className="h-12 bg-card border-border focus-visible:ring-primary"
                  disabled={registerMutation.isPending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="h-12 bg-card border-border focus-visible:ring-primary"
                  disabled={registerMutation.isPending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 bg-card border-border focus-visible:ring-primary"
                  disabled={registerMutation.isPending}
                />
                
                {/* Requirements indicator list */}
                <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-card border border-border/50 rounded-lg text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {hasMinLen ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-red-500/80" />}
                    <span>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasUpper ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-red-500/80" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasLower ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-red-500/80" />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasNum ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-red-500/80" />}
                    <span>Numeric (0-9)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 bg-card border-border focus-visible:ring-primary"
                  disabled={registerMutation.isPending}
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold shadow-md shadow-primary/10 transition-transform active:scale-[0.98] mt-4"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">Or</span>
            </div>
          </div>

          <Button 
            className="w-full bg-[#24292e] text-white hover:bg-[#24292e]/90 h-12 text-base font-medium shadow-sm"
            onClick={() => alert("GitHub OAuth registration is currently simulated.")}
            disabled={registerMutation.isPending}
          >
            <SiGithub className="mr-3 h-5 w-5" />
            Sign up with GitHub
          </Button>

          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

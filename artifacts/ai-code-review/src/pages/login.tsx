import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminalSquare, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { tokenStore } from "@/lib/tokenStore";
const API_URL = import.meta.env.VITE_API_URL;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [_, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    loginMutation.mutate({
      data: {
        email,
        password,
        rememberMe,
      }
    }, {
      onSuccess: (data) => {
        tokenStore.setToken(data.token);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        setError(err.data?.error || "Login failed. Please check your credentials.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-card relative overflow-hidden flex-col justify-between p-12 border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

        {/* Animated Particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 bg-primary rounded-full"
              initial={{
                x: Math.random() * 500,
                y: Math.random() * 800,
                opacity: Math.random()
              }}
              animate={{
                y: [null, Math.random() * 800],
                opacity: [null, Math.random(), 0]
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-primary mb-12 w-max">
            <TerminalSquare className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight font-mono">AI Code Review</span>
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4 text-white">
            Ship code with absolute confidence.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            The intelligent review system that catches vulnerabilities, bugs, and technical debt before they reach production.
          </p>
        </div>

        {/* Mockup Card */}
        <div className="relative z-10 w-full max-w-lg mt-12 perspective-1000">
          <motion.div
            initial={{ rotateY: 5, rotateX: 5, opacity: 0, y: 50 }}
            animate={{ rotateY: -5, rotateX: 10, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-[#1e1e1e] rounded-xl border border-border/50 shadow-2xl overflow-hidden"
          >
            <div className="h-8 bg-[#2d2d2d] flex items-center px-4 gap-2 border-b border-border/50">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <div className="ml-4 text-xs font-mono text-muted-foreground">Analysis Complete</div>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-background/50 rounded-lg p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Quality</div>
                  <div className="text-2xl font-bold text-green-500">94/100</div>
                </div>
                <div className="flex-1 bg-background/50 rounded-lg p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Security</div>
                  <div className="text-2xl font-bold text-red-500">62/100</div>
                </div>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-0.5">●</div>
                  <div className="text-muted-foreground">
                    <span className="text-red-400">Critical:</span> SQL Injection vulnerability found in <span className="text-[#ce9178]">userAuth.ts</span> line 42.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-yellow-500 mt-0.5">●</div>
                  <div className="text-muted-foreground">
                    <span className="text-yellow-400">Warning:</span> High cyclomatic complexity (14) in <span className="text-[#ce9178]">paymentProcessor.js</span>.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8 flex lg:hidden items-center gap-2 text-primary">
          <TerminalSquare className="h-6 w-6" />
          <span className="font-bold tracking-tight font-mono">AI Code Review</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3.5 flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 bg-card border-border focus-visible:ring-primary"
                  disabled={loginMutation.isPending}
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
                  disabled={loginMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-border"
                    disabled={loginMutation.isPending}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Password reset workflow is currently simulated."); }} className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold shadow-md shadow-primary/10 transition-transform active:scale-[0.98]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
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
            onClick={async () => {
              try {
                const res = await fetch(
                  `${API_URL}/api/auth/github/url?origin=${encodeURIComponent(window.location.origin)}`
                );
                const data = await res.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  alert(data.error || "Failed to get GitHub authorize URL. Please verify GITHUB_CLIENT_ID configuration on backend.");
                }
              } catch (err) {
                alert("Failed to connect to API server.");
              }
            }}
            disabled={loginMutation.isPending}
          >
            <SiGithub className="mr-3 h-5 w-5" />
            Continue with GitHub
          </Button>

          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

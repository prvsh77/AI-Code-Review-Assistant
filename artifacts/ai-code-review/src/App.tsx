import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { setAuthTokenGetter, useRefreshToken } from "@workspace/api-client-react";
import { tokenStore } from "@/lib/tokenStore";
import { Loader2 } from "lucide-react";

// Page Imports
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Repositories from "@/pages/repositories";
import PullRequests from "@/pages/pull-requests";
import Analysis from "@/pages/analysis";
import Review from "@/pages/review";
import ReviewCode from "@/pages/review-code";
import Security from "@/pages/security";
import Analytics from "@/pages/analytics";
import Documentation from "@/pages/documentation";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import History from "@/pages/history";
import NotFound from "@/pages/not-found";
import GitHubCallback from "@/pages/GitHubCallback";

const queryClient = new QueryClient();

// Setup the custom fetch bearer token getter
setAuthTokenGetter(() => tokenStore.getToken());

function ProtectedRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  const token = tokenStore.getToken();
  if (!token) {
    return <Redirect to="/login" />;
  }
  return <Route path={path} component={Component} />;
}

function PublicRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  const token = tokenStore.getToken();

  if (token && (path === "/login" || path === "/register")) {
    return <Redirect to="/dashboard" />;
  }
  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <PublicRoute path="/login" component={Login} />
      <PublicRoute path="/register" component={Register} />
      <PublicRoute path="/auth/github/callback" component={GitHubCallback} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/repositories" component={Repositories} />
      <ProtectedRoute path="/pull-requests" component={PullRequests} />
      <ProtectedRoute path="/analysis/:jobId" component={Analysis} />
      <ProtectedRoute path="/review/:id" component={Review} />
      <ProtectedRoute path="/review/:id/code" component={ReviewCode} />
      <ProtectedRoute path="/security" component={Security} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/documentation" component={Documentation} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [initialized, setInitialized] = useState(false);
  const refreshMutation = useRefreshToken();

  useEffect(() => {
    // Attempt silent token refresh on app startup if a session exists
    if (tokenStore.hasSession()) {
      refreshMutation.mutate(undefined as any, {
        onSuccess: (data) => {
          tokenStore.setToken(data.token);
          setInitialized(true);
        },
        onError: () => {
          tokenStore.setToken(null);
          setInitialized(true);
        },
      });
    } else {
      setInitialized(true);
    }
  }, []);

  // Periodic token refresh logic (every 14 minutes before 15m JWT expiry)
  useEffect(() => {
    const token = tokenStore.getToken();
    if (!token) return;

    const interval = setInterval(() => {
      refreshMutation.mutate(undefined as any, {
        onSuccess: (data) => {
          tokenStore.setToken(data.token);
        },
        onError: () => {
          tokenStore.setToken(null);
          window.location.href = "/login";
        },
      });
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [initialized]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground font-sans">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-mono">Securing session...</p>
      </div>
    );
  }

  return <Router />;
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

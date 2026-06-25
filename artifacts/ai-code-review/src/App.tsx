import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

// Page Imports
import Landing from "@/pages/landing";
import Login from "@/pages/login";
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/repositories" component={Repositories} />
      <Route path="/pull-requests" component={PullRequests} />
      <Route path="/analysis/:jobId" component={Analysis} />
      <Route path="/review/:id" component={Review} />
      <Route path="/review/:id/code" component={ReviewCode} />
      <Route path="/security" component={Security} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

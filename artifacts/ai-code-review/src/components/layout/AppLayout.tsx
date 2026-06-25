import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderGit2, 
  GitPullRequest, 
  CheckSquare, 
  BarChart3, 
  ShieldAlert, 
  FileText, 
  History, 
  Settings,
  TerminalSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: FolderGit2 },
  { href: "/pull-requests", label: "Pull Requests", icon: GitPullRequest },
  { href: "/security", label: "Security", icon: ShieldAlert },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/documentation", label: "Documentation", icon: FileText },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <TerminalSquare className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight font-mono">AI Code Review</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/profile" className="flex items-center gap-3 hover:bg-muted p-2 rounded-md transition-colors">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">John Doe</span>
              <span className="text-xs text-muted-foreground mt-1 font-mono">@johndoe</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

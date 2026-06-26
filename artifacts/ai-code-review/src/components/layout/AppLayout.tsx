import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AiChatWidget } from "@/components/AiChatWidget";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  CheckSquare,
  BarChart3,
  ShieldAlert,
  FileText,
  History as HistoryIcon,
  Settings,
  TerminalSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: FolderGit2 },
  { href: "/pull-requests", label: "Pull Requests", icon: GitPullRequest, badge: 3 },
  { href: "/analysis/1", label: "AI Reviews", icon: CheckSquare },
  { href: "/security", label: "Security", icon: ShieldAlert, badge: 2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/documentation", label: "Documentation", icon: FileText },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", newState ? "true" : "false");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-shrink-0 border-r border-border bg-card flex flex-col z-20 relative"
      >
        <div className="h-14 flex items-center px-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3 text-primary overflow-hidden w-full">
            <TerminalSquare className="h-6 w-6 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-sm tracking-tight font-mono whitespace-nowrap"
                >
                  AI Code Review
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center justify-between bg-background border border-border rounded-md px-2 py-1.5 cursor-pointer hover:border-primary/50 transition-colors">
              <span className="text-xs font-medium truncate">acme-corp</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            const Icon = item.icon;

            const NavContent = (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-md transition-all duration-200 group ${
                  isCollapsed ? "justify-center py-2.5 px-0" : "px-3 py-2"
                } ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
                  />
                )}
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] rounded-full">
                    {item.badge}
                  </Badge>
                )}
                {isCollapsed && item.badge && (
                  <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{NavContent}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="h-4 px-1 text-[10px] rounded-sm">
                        {item.badge}
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavContent;
          })}
        </nav>

        <div className="p-2 border-t border-border/50">
          <Link href="/profile" className={`flex items-center gap-3 rounded-md transition-colors hover:bg-muted/50 ${isCollapsed ? "justify-center p-2" : "p-2"}`}>
            <Avatar className="h-8 w-8 border border-border flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">JD</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium leading-none truncate">John Doe</span>
                <span className="text-xs text-muted-foreground mt-1 font-mono truncate">@johndoe</span>
              </div>
            )}
          </Link>
        </div>

        <button
          onClick={toggleCollapse}
          className="absolute -right-3 bottom-16 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors z-30"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-background">
        {/* Top Navbar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-14 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 z-10 flex-shrink-0"
        >
          <div className="w-96 relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search repositories, PRs..."
              className="h-8 pl-9 bg-muted/30 border-border/50 focus-visible:ring-primary focus-visible:bg-background transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Synced
            </div>

            <button className="relative p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <div className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-8 w-8 border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@acme.corp</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
      <AiChatWidget />
    </div>
  );
}

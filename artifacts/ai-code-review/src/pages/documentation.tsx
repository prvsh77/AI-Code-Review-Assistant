import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Download, Folder, File, Link2, Share2, Search, BookOpen, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Documentation() {
  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="h-[calc(100vh-6rem)] flex flex-col space-y-6 pt-2">
        <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              Documentation
            </h1>
            <p className="text-muted-foreground mt-2">Auto-generated API docs and architecture overviews.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-border hover:bg-muted font-medium bg-background">
              <Link2 className="mr-2 h-4 w-4" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" className="border-border hover:bg-muted font-medium bg-background">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </motion.div>

        <motion.div variants={item} className="flex-1 flex gap-px min-h-0 bg-border rounded-xl overflow-hidden border border-border shadow-2xl">
          {/* File Tree Sidebar (Left) */}
          <div className="w-64 flex-shrink-0 bg-card flex flex-col z-10 border-r border-border/50">
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="text" placeholder="Search docs..." className="h-8 pl-8 text-xs bg-muted/30 border-border/50 focus-visible:ring-primary" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 px-2 py-1.5 font-semibold text-foreground rounded hover:bg-muted/30 cursor-pointer transition-colors">
                    <Folder className="h-4 w-4 text-blue-400 fill-blue-400/20" />
                    api-server
                  </div>
                  <div className="pl-5 space-y-0.5 relative before:absolute before:left-4 before:top-0 before:bottom-2 before:w-px before:bg-border/50">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-primary bg-primary/10 rounded cursor-pointer font-medium relative before:absolute before:left-[-4px] before:top-1/2 before:w-2 before:h-px before:bg-border/50">
                      <FileText className="h-3.5 w-3.5" />
                      Authentication API
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded cursor-pointer transition-colors relative before:absolute before:left-[-4px] before:top-1/2 before:w-2 before:h-px before:bg-border/50">
                      <FileText className="h-3.5 w-3.5" />
                      Review Engine
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded cursor-pointer transition-colors relative before:absolute before:left-[-4px] before:top-1/2 before:w-2 before:h-px before:bg-border/50">
                      <FileText className="h-3.5 w-3.5" />
                      Webhooks
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm mt-4">
                  <div className="flex items-center gap-2 px-2 py-1.5 font-semibold text-foreground rounded hover:bg-muted/30 cursor-pointer transition-colors">
                    <Folder className="h-4 w-4 text-blue-400 fill-blue-400/20" />
                    frontend
                  </div>
                  <div className="pl-5 space-y-0.5 relative before:absolute before:left-4 before:top-0 before:bottom-2 before:w-px before:bg-border/50">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded cursor-pointer transition-colors relative before:absolute before:left-[-4px] before:top-1/2 before:w-2 before:h-px before:bg-border/50">
                      <FileText className="h-3.5 w-3.5" />
                      Components Guide
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded cursor-pointer transition-colors relative before:absolute before:left-[-4px] before:top-1/2 before:w-2 before:h-px before:bg-border/50">
                      <FileText className="h-3.5 w-3.5" />
                      State Management
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area (Center) */}
          <div className="flex-1 bg-[#0d1117] flex flex-col relative z-0 overflow-hidden">
            <div className="h-12 flex items-center px-6 border-b border-[#30363d] bg-[#0d1117] text-sm text-muted-foreground font-mono">
              api-server / <span className="text-foreground ml-1">Authentication API</span>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-8 md:p-12 max-w-4xl mx-auto prose prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h1:tracking-tight prose-a:text-primary prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <h1 id="authentication-api">Authentication API</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Handles user authentication, session management, and GitHub OAuth integrations for the AI Code Review platform.
                </p>
                
                <h2 id="architecture" className="flex items-center gap-2 mt-12 mb-4 border-b border-[#30363d] pb-2 text-xl">
                  Architecture
                </h2>
                <p>
                  The authentication service uses a JWT-based stateless architecture. Tokens are signed using <code>RS256</code> and have a short expiration time (15 minutes), coupled with a longer-lived refresh token stored in a secure HttpOnly cookie.
                </p>
                
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 my-6 font-mono text-[13px] leading-relaxed">
                  <div className="text-[#8b949e] mb-2 italic">// Environment Configuration</div>
                  <div><span className="text-[#79c0ff]">AUTH_JWT_SECRET</span>=<span className="text-[#a5d6ff]">"-----BEGIN PUBLIC KEY-----\n..."</span></div>
                  <div><span className="text-[#79c0ff]">AUTH_TOKEN_EXPIRY</span>=<span className="text-[#a5d6ff]">"15m"</span></div>
                  <div><span className="text-[#79c0ff]">AUTH_REFRESH_EXPIRY</span>=<span className="text-[#a5d6ff]">"7d"</span></div>
                </div>

                <h2 id="endpoints" className="flex items-center gap-2 mt-12 mb-6 border-b border-[#30363d] pb-2 text-xl">
                  Endpoints
                </h2>

                <div className="space-y-8">
                  {/* Endpoint Block */}
                  <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22]/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#161b22] px-5 py-3 border-b border-[#30363d]">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-mono text-xs font-bold rounded">POST</span>
                        <span className="font-mono text-foreground font-medium text-sm">/api/v1/auth/login</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground mb-4">Authenticates a user via email/password and returns a JWT access token.</p>
                      
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-6">Request Body</h4>
                      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg font-mono text-[13px] text-[#e6edf3]">
                        {"{"}<br/>
                        &nbsp;&nbsp;<span className="text-[#79c0ff]">"email"</span>: <span className="text-[#a5d6ff]">"string (email)"</span>,<br/>
                        &nbsp;&nbsp;<span className="text-[#79c0ff]">"password"</span>: <span className="text-[#a5d6ff]">"string (min 8 chars)"</span><br/>
                        {"}"}
                      </div>

                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-6">Response (200 OK)</h4>
                      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg font-mono text-[13px] text-[#e6edf3]">
                        {"{"}<br/>
                        &nbsp;&nbsp;<span className="text-[#79c0ff]">"token"</span>: <span className="text-[#a5d6ff]">"eyJhbGciOiJSUzI1NiIs..."</span>,<br/>
                        &nbsp;&nbsp;<span className="text-[#79c0ff]">"user"</span>: {"{"}<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#79c0ff]">"id"</span>: <span className="text-[#79c0ff]">142</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#79c0ff]">"name"</span>: <span className="text-[#a5d6ff]">"John Doe"</span><br/>
                        &nbsp;&nbsp;{"}"}<br/>
                        {"}"}
                      </div>
                    </div>
                  </div>

                  {/* Endpoint Block 2 */}
                  <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22]/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#161b22] px-5 py-3 border-b border-[#30363d]">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-xs font-bold rounded">GET</span>
                        <span className="font-mono text-foreground font-medium text-sm">/api/v1/auth/github/callback</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">Handles the OAuth callback from GitHub and establishes a session.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Table of Contents (Right) */}
          <div className="hidden xl:flex w-56 flex-shrink-0 bg-card flex-col z-10 border-l border-border/50 px-4 py-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">On this page</h4>
            <div className="space-y-2.5 text-sm">
              <a href="#authentication-api" className="block text-primary font-medium hover:underline">Authentication API</a>
              <a href="#architecture" className="block text-muted-foreground hover:text-foreground transition-colors pl-3 border-l-2 border-primary">Architecture</a>
              <a href="#endpoints" className="block text-muted-foreground hover:text-foreground transition-colors pl-3 border-l-2 border-transparent hover:border-border">Endpoints</a>
              <div className="pl-6 space-y-2 text-xs">
                <a href="#" className="block text-muted-foreground hover:text-foreground font-mono">POST /login</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground font-mono">GET /github/callback</a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
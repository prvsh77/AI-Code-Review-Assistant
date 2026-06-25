import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronRight, Folder, File, Code2 } from "lucide-react";

export default function Documentation() {
  return (
    <AppLayout>
      <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">Documentation</h1>
            <p className="text-muted-foreground mt-1">Auto-generated API docs and architecture overviews.</p>
          </div>
          <Button variant="outline" className="border-border hover:bg-muted">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* File Tree Sidebar */}
          <Card className="w-64 flex-shrink-0 bg-card/50 border-border/50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Generated Docs
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground font-medium rounded bg-muted/30">
                  <Folder className="h-4 w-4 text-blue-400" />
                  api-server
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-sm text-primary bg-primary/10 rounded cursor-pointer">
                    <File className="h-3.5 w-3.5" />
                    Authentication API
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    <File className="h-3.5 w-3.5" />
                    Review Engine
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground font-medium rounded hover:bg-muted/30 mt-2">
                  <Folder className="h-4 w-4 text-blue-400" />
                  frontend
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    <File className="h-3.5 w-3.5" />
                    Components
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Main Content Area */}
          <Card className="flex-1 bg-card border-border flex flex-col overflow-hidden shadow-inner">
            <Tabs defaultValue="readme" className="flex flex-col h-full">
              <div className="px-4 pt-3 border-b border-border bg-muted/10">
                <TabsList className="bg-transparent h-auto p-0 border-b-0">
                  <TabsTrigger value="readme" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 pb-3 pt-2">Overview</TabsTrigger>
                  <TabsTrigger value="api" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 pb-3 pt-2">API Endpoints</TabsTrigger>
                  <TabsTrigger value="types" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 pb-3 pt-2">Types</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1">
                <TabsContent value="readme" className="m-0 p-8 prose prose-invert max-w-none">
                  <h1 className="text-foreground">Authentication API</h1>
                  <p className="text-muted-foreground text-lg">Handles user authentication, session management, and OAuth integrations.</p>
                  
                  <h3 className="text-foreground mt-8">Architecture</h3>
                  <p className="text-muted-foreground">The authentication service uses a JWT-based stateless architecture. Tokens are signed using RS256 and have a short expiration time (15 minutes), coupled with a longer-lived refresh token stored in a secure HttpOnly cookie.</p>
                  
                  <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 mt-6 font-mono text-sm text-[#d4d4d4]">
                    <div className="text-green-500 mb-2">// Configuration example</div>
                    <div>AUTH_JWT_SECRET="-----BEGIN PUBLIC KEY-----\n..."</div>
                    <div>AUTH_TOKEN_EXPIRY="15m"</div>
                    <div>AUTH_REFRESH_EXPIRY="7d"</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="api" className="m-0 p-8">
                  <div className="space-y-6">
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center gap-3 bg-muted/30 px-4 py-3 border-b border-border">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 font-mono text-xs font-bold rounded">POST</span>
                        <span className="font-mono text-foreground font-medium">/api/v1/auth/login</span>
                      </div>
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Authenticates a user and returns a JWT access token.</p>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Request Body</h4>
                          <div className="bg-[#1e1e1e] p-3 rounded font-mono text-xs text-[#d4d4d4]">
                            <span className="text-[#9cdcfe]">email</span>: <span className="text-[#ce9178]">"string"</span>,<br/>
                            <span className="text-[#9cdcfe]">password</span>: <span className="text-[#ce9178]">"string"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="types" className="m-0 p-8 flex items-center justify-center h-full text-muted-foreground">
                  Select a type to view its definition.
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

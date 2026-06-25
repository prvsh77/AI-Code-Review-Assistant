import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReviewFiles, getGetReviewFilesQueryKey, useGetReviewComments, getGetReviewCommentsQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileCode2, MessageSquare, AlertTriangle, Info, Zap, ShieldAlert, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewCode() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);
  const searchParams = new URLSearchParams(window.location.search);
  const initialFile = searchParams.get("file");

  const { data: files, isLoading: filesLoading } = useGetReviewFiles(reviewId, { query: { queryKey: getGetReviewFilesQueryKey(reviewId) } });
  const { data: comments, isLoading: commentsLoading } = useGetReviewComments(reviewId, { query: { queryKey: getGetReviewCommentsQueryKey(reviewId) } });

  const [selectedFile, setSelectedFile] = useState<string | null>(initialFile || null);

  // If no file selected but files loaded, select first file
  useMemo(() => {
    if (!selectedFile && files && files.length > 0) {
      setSelectedFile(files[0].filePath);
    }
  }, [files, selectedFile]);

  const currentFileComments = comments?.filter(c => c.filePath === selectedFile) || [];

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case "critical": return <ShieldAlert className="h-4 w-4 text-red-600" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low": return <Info className="h-4 w-4 text-blue-400" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case "critical": return <Badge className="bg-red-600 hover:bg-red-700 text-white">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Medium</Badge>;
      case "low": return <Badge className="bg-blue-400 hover:bg-blue-500 text-black">Low</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight font-mono">Code Viewer</h1>
          <p className="text-sm text-muted-foreground">Review file changes and AI suggestions side-by-side.</p>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Files Sidebar */}
          <Card className="w-64 flex-shrink-0 bg-card/50 border-border/50 flex flex-col overflow-hidden rounded-md">
            <div className="p-3 border-b border-border bg-muted/20 font-medium text-sm">
              Files Changed
            </div>
            <ScrollArea className="flex-1">
              {filesLoading ? (
                <div className="p-3 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {files?.map(file => {
                    const hasComments = comments?.some(c => c.filePath === file.filePath);
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file.filePath)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${selectedFile === file.filePath ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                      >
                        <span className="truncate max-w-[160px]" title={file.filePath}>{file.filePath.split('/').pop()}</span>
                        {hasComments && <div className="h-2 w-2 rounded-full bg-yellow-500"></div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Main Area: Code + Comments */}
          <div className="flex-1 flex gap-4 min-w-0">
            {/* Code Editor Mock */}
            <Card className="flex-1 bg-[#1e1e1e] border-border overflow-hidden flex flex-col rounded-md shadow-inner">
              <div className="h-10 border-b border-[#2d2d2d] bg-[#252526] flex items-center px-4">
                <FileCode2 className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm font-mono text-[#cccccc] truncate">{selectedFile || 'Select a file'}</span>
              </div>
              <ScrollArea className="flex-1 p-4">
                {!selectedFile ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Select a file from the sidebar to view code.
                  </div>
                ) : (
                  <div className="font-mono text-sm leading-relaxed text-[#d4d4d4] whitespace-pre">
                    <div className="flex group hover:bg-[#2a2d2e] cursor-text">
                      <div className="w-10 text-right pr-4 text-[#858585] select-none">1</div>
                      <div className="flex-1 text-[#569cd6]">import</div>
                      <div className="text-[#9cdcfe]">{" { useState } "}</div>
                      <div className="text-[#569cd6]">from</div>
                      <div className="text-[#ce9178]">"react"</div>
                      <div className="text-[#d4d4d4]">;</div>
                    </div>
                    <div className="flex group hover:bg-[#2a2d2e] cursor-text">
                      <div className="w-10 text-right pr-4 text-[#858585] select-none">2</div>
                    </div>
                    <div className="flex group hover:bg-[#2a2d2e] cursor-text bg-[#3a3d41]/50 border-l-2 border-yellow-500">
                      <div className="w-10 text-right pr-4 text-yellow-500 select-none">3</div>
                      <div className="flex-1 text-[#569cd6]">export default function</div>
                      <div className="text-[#4ec9b0]"> UserProfile</div>
                      <div className="text-[#d4d4d4]">() {"{"}</div>
                    </div>
                    <div className="flex group hover:bg-[#2a2d2e] cursor-text">
                      <div className="w-10 text-right pr-4 text-[#858585] select-none">4</div>
                      <div className="pl-4 text-[#569cd6]">const</div>
                      <div className="text-[#9cdcfe]"> [data, setData] </div>
                      <div className="text-[#d4d4d4]">= </div>
                      <div className="text-[#dcdcaa]">useState</div>
                      <div className="text-[#d4d4d4]">(</div>
                      <div className="text-[#569cd6]">null</div>
                      <div className="text-[#d4d4d4]">);</div>
                    </div>
                    {/* Mocked code lines... */}
                    {[...Array(30)].map((_, i) => (
                      <div key={i+5} className="flex group hover:bg-[#2a2d2e] cursor-text">
                        <div className="w-10 text-right pr-4 text-[#858585] select-none">{i + 5}</div>
                        <div className="pl-4 text-[#6a9955] italic">// more code...</div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* AI Comments Panel */}
            <Card className="w-80 flex-shrink-0 bg-card border-border flex flex-col overflow-hidden rounded-md">
              <div className="p-3 border-b border-border bg-muted/20 font-medium text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Comments
                {currentFileComments.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">{currentFileComments.length}</Badge>
                )}
              </div>
              <ScrollArea className="flex-1">
                {commentsLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                ) : currentFileComments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                    <Check className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                    No issues found in this file.
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {currentFileComments.map(comment => (
                      <div key={comment.id} className="border border-border rounded-lg bg-card overflow-hidden">
                        <div className="bg-muted/30 px-3 py-2 border-b border-border flex justify-between items-center text-xs">
                          <span className="font-mono text-muted-foreground">Line {comment.line}</span>
                          {getSeverityBadge(comment.severity)}
                        </div>
                        <div className="p-3 text-sm space-y-3">
                          <p className="text-foreground leading-relaxed">{comment.message}</p>
                          {comment.suggestion && (
                            <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                              <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Suggested Fix</p>
                              <p className="text-muted-foreground text-xs leading-relaxed">{comment.suggestion}</p>
                            </div>
                          )}
                          {comment.codeSnippet && (
                            <div className="mt-2 bg-[#1e1e1e] rounded-md p-2 overflow-x-auto text-xs font-mono text-[#d4d4d4]">
                              <pre>{comment.codeSnippet}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

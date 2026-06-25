import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReviewFiles, getGetReviewFilesQueryKey, useGetReviewComments, getGetReviewCommentsQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileCode2, MessageSquare, AlertTriangle, Info, Zap, ShieldAlert, Check, ChevronRight, CheckCircle2, XCircle, BrainCircuit, Code2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "react-day-picker";

export default function ReviewCode() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);
  const searchParams = new URLSearchParams(window.location.search);
  const initialFile = searchParams.get("file");

  const { data: files, isLoading: filesLoading } = useGetReviewFiles(reviewId, { query: { queryKey: getGetReviewFilesQueryKey(reviewId) } });
  const { data: comments, isLoading: commentsLoading } = useGetReviewComments(reviewId, { query: { queryKey: getGetReviewCommentsQueryKey(reviewId) } });

  const [selectedFile, setSelectedFile] = useState<string | null>(initialFile || null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  // If no file selected but files loaded, select first file
  useMemo(() => {
    if (!selectedFile && files && files.length > 0) {
      setSelectedFile(files[0].filePath);
    }
  }, [files, selectedFile]);

  const currentFileComments = comments?.filter(c => c.filePath === selectedFile) || [];

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case "critical": return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low": return <Info className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case "critical": return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 uppercase tracking-wider text-[10px]">Critical</Badge>;
      case "high": return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase tracking-wider text-[10px]">High</Badge>;
      case "medium": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 uppercase tracking-wider text-[10px]">Medium</Badge>;
      case "low": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase tracking-wider text-[10px]">Low</Badge>;
      default: return <Badge variant="outline" className="uppercase tracking-wider text-[10px]">Info</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-6rem)] flex flex-col pt-2">
        <div className="flex-1 flex gap-px min-h-0 bg-border rounded-xl overflow-hidden border border-border shadow-2xl">
          {/* Files Sidebar (w-56) */}
          <div className="w-64 flex-shrink-0 bg-card flex flex-col z-10">
            <div className="h-12 flex items-center px-4 border-b border-border/50 bg-muted/10">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Files Explorer</span>
            </div>
            <ScrollArea className="flex-1">
              {filesLoading ? (
                <div className="p-3 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full bg-muted/50" />)}
                </div>
              ) : (
                <div className="py-2">
                  {files?.map(file => {
                    const fileComments = comments?.filter(c => c.filePath === file.filePath) || [];
                    const hasError = fileComments.some(c => c.severity === 'critical' || c.severity === 'high');
                    const hasWarn = fileComments.some(c => c.severity === 'medium');
                    const isSelected = selectedFile === file.filePath;
                    
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file.filePath)}
                        className={`w-full flex items-center px-3 py-2 text-sm transition-all relative ${
                          isSelected 
                            ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-r-2 border-transparent'
                        }`}
                      >
                        <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                        <FileCode2 className={`h-4 w-4 mr-2 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/70"}`} />
                        <span className="truncate flex-1 text-left">{file.filePath.split('/').pop()}</span>
                        
                        {fileComments.length > 0 && (
                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            {hasError ? (
                              <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            ) : hasWarn ? (
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                            <span className="text-[10px] opacity-70 font-mono">{fileComments.length}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Main Area: Code Editor */}
          <div className="flex-1 bg-[#0d1117] flex flex-col min-w-0 relative z-0">
            <div className="h-12 flex items-center justify-between px-4 border-b border-[#30363d] bg-[#0d1117]">
              <div className="flex items-center text-sm font-mono">
                <span className="text-muted-foreground">{selectedFile?.split('/').slice(0, -1).join('/')}/</span>
                <span className="text-foreground font-semibold ml-0.5">{selectedFile?.split('/').pop()}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span className="text-green-500">+24</span>
                <span className="text-red-500">-12</span>
              </div>
            </div>
            <ScrollArea className="flex-1">
              {!selectedFile ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Select a file from the sidebar to view code.
                </div>
              ) : (
                <div className="font-mono text-[13px] leading-[22px] text-[#e6edf3] pb-10 pt-2 whitespace-pre">
                  {/* Mocked code lines... */}
                  <div className="flex group hover:bg-[#21262d]/50 cursor-text pr-4">
                    <div className="w-12 flex-shrink-0 text-right pr-4 text-[#6e7681] select-none border-r border-transparent">1</div>
                    <div className="pl-4"><span className="text-[#ff7b72]">import</span> <span className="text-[#e6edf3]">{" { useState } "}</span> <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">"react"</span>;</div>
                  </div>
                  <div className="flex group hover:bg-[#21262d]/50 cursor-text pr-4">
                    <div className="w-12 flex-shrink-0 text-right pr-4 text-[#6e7681] select-none border-r border-transparent">2</div>
                  </div>
                  
                  {/* A line with an issue */}
                  <div 
                    onClick={() => setSelectedLine(3)}
                    className={`flex group cursor-pointer pr-4 transition-colors ${selectedLine === 3 ? 'bg-red-500/10' : 'hover:bg-[#21262d]/50'}`}
                  >
                    <div className={`w-12 flex-shrink-0 text-right pr-4 select-none border-r-2 flex items-center justify-end gap-1 ${selectedLine === 3 ? 'text-red-400 border-red-500' : 'text-[#6e7681] border-red-500/50 group-hover:border-red-500'}`}>
                      <ShieldAlert className="h-3 w-3 text-red-500 absolute left-1" />
                      3
                    </div>
                    <div className="pl-4 flex-1 flex">
                      <div className="flex-1"><span className="text-[#ff7b72]">const</span> <span className="text-[#79c0ff]">query</span> = <span className="text-[#a5d6ff]">\`SELECT * FROM users WHERE id = \${req.body.id}\`</span>;</div>
                    </div>
                  </div>
                  
                  {[...Array(40)].map((_, i) => (
                    <div key={i+4} className="flex group hover:bg-[#21262d]/50 cursor-text pr-4">
                      <div className="w-12 flex-shrink-0 text-right pr-4 text-[#6e7681] select-none border-r border-transparent">{i + 4}</div>
                      <div className="pl-4 text-[#8b949e] italic">// normal code line...</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* AI Comments Panel (w-80) */}
          <div className="w-80 flex-shrink-0 bg-card flex flex-col z-10 border-l border-border/50 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.3)]">
            <div className="h-12 flex items-center px-4 border-b border-border/50 bg-muted/10 gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-foreground">AI Insights</span>
              {currentFileComments.length > 0 && (
                <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary hover:bg-primary/20 h-5 px-1.5">{currentFileComments.length}</Badge>
              )}
            </div>
            <ScrollArea className="flex-1 bg-muted/5">
              {commentsLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl bg-card border border-border/50" />
                  ))}
                </div>
              ) : currentFileComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Looking good!</p>
                    <p className="text-sm mt-1">No issues detected in this file by any AI agent.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {currentFileComments.map(comment => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-xl bg-card border overflow-hidden shadow-sm transition-colors ${selectedLine === comment.line ? 'border-primary shadow-[0_0_15px_rgba(0,188,212,0.15)] ring-1 ring-primary' : 'border-border hover:border-border/80'}`}
                        onClick={() => setSelectedLine(comment.line)}
                      >
                        <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center bg-muted/10">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(comment.severity)}
                            <span className="font-mono text-[10px] text-muted-foreground font-semibold">L{comment.line}</span>
                          </div>
                          {getSeverityBadge(comment.severity)}
                        </div>
                        <div className="p-3 text-[13px] space-y-3">
                          <p className="text-foreground/90 leading-relaxed font-medium">{comment.message}</p>
                          
                          {comment.suggestion && (
                            <div className="rounded-md overflow-hidden border border-green-500/20 bg-green-500/5">
                              <div className="bg-green-500/10 px-2 py-1 flex items-center gap-1.5 border-b border-green-500/10">
                                <Code2 className="h-3 w-3 text-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Suggested Fix</span>
                              </div>
                              <div className="p-2 font-mono text-[11px] text-[#e6edf3] bg-[#0d1117] overflow-x-auto whitespace-pre">
                                {comment.suggestion}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2 border-t border-border/50">
                            <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] text-green-500 hover:text-green-400 hover:bg-green-500/10 bg-green-500/5 border border-transparent hover:border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1.5" /> Accept
                            </Button>
                            <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20">
                              <XCircle className="h-3 w-3 mr-1.5" /> Ignore
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
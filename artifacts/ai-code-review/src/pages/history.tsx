import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReviewHistory, getGetReviewHistoryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, CheckCircle2, XCircle, LayoutList, List, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { normalizeArray } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function History() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const { data: history, isLoading } = useGetReviewHistory({ search: search || undefined }, { query: { queryKey: getGetReviewHistoryQueryKey({ search: search || undefined }) } });
  const historyData = normalizeArray<any>(history, "ReviewHistory");

  const getScoreBadge = (score: number) => {
    if (score >= 85) return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0.5">{score}/100</Badge>;
    if (score >= 70) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0.5">{score}/100</Badge>;
    return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5">{score}/100</Badge>;
  };

  const getScoreDot = (score: number) => {
    if (score >= 85) return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    if (score >= 70) return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]";
    return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case "failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
    }
  };

  // Group history items by date
  const groupedHistory = historyData.reduce((acc: Record<string, any[]>, item) => {
    const date = new Date(item.reviewedAt);
    let group = "";
    if (isToday(date)) group = "Today";
    else if (isYesterday(date)) group = "Yesterday";
    else if (differenceInDays(new Date(), date) < 7) group = "Last 7 Days";
    else group = format(date, 'MMMM yyyy');

    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">Review History</h1>
            <p className="text-muted-foreground mt-2">Search and view past AI code reviews.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search by repo, PR..."
                className="pl-10 bg-card border-border/60 focus-visible:ring-primary h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-card border border-border/60 rounded-md p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("timeline")}
                className={`h-8 w-8 rounded-sm ${viewMode === 'timeline' ? 'bg-muted shadow-sm text-foreground' : 'text-muted-foreground'}`}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("table")}
                className={`h-8 w-8 rounded-sm ${viewMode === 'table' ? 'bg-muted shadow-sm text-foreground' : 'text-muted-foreground'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          {isLoading ? (
            <Card className="bg-card border-border/60 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-4 w-4 rounded-full mt-1" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : historyData && historyData.length > 0 ? (
            viewMode === "timeline" ? (
              <div className="space-y-8">
                {Object.entries(groupedHistory || {}).map(([group, items], i) => (
                  <div key={group} className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pl-2">{group}</h3>
                    <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
                      <div className="divide-y divide-border/50">
                        {(items as any[]).map((item) => (
                          <Link key={item.id} href={`/review/${item.id}`}>
                            <div className="p-4 sm:p-5 flex items-start sm:items-center gap-4 hover:bg-muted/10 transition-colors cursor-pointer group">
                              <div className="relative flex items-center justify-center shrink-0 w-8">
                                <div className="absolute top-0 bottom-0 w-px bg-border/50 -z-10 group-first:top-1/2 group-last:bottom-1/2" />
                                <div className={`h-3 w-3 rounded-full ${getScoreDot(item.score)} border-2 border-card z-10`} />
                              </div>
                              
                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-foreground truncate">{item.repositoryName}</span>
                                    <span className="font-mono text-primary text-sm">#{item.pullRequestNumber}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">{item.author}</span>
                                    <span>•</span>
                                    <span>{format(new Date(item.reviewedAt), 'h:mm a')}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 sm:ml-auto">
                                  {getScoreBadge(item.score)}
                                  <Badge variant="secondary" className="capitalize bg-background border-border/50 text-muted-foreground font-medium flex items-center gap-1.5 h-6">
                                    {getStatusIcon(item.status)}
                                    {item.status}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border/60 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/5 border-b border-border/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 font-semibold">PR</TableHead>
                        <TableHead className="font-semibold">Repository</TableHead>
                        <TableHead className="font-semibold">Author</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Score</TableHead>
                        <TableHead className="text-right pr-6 font-semibold">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/20 border-border/50 cursor-pointer group" onClick={() => window.location.href=`/review/${item.id}`}>
                          <TableCell className="pl-6 font-mono text-primary font-medium">#{item.pullRequestNumber}</TableCell>
                          <TableCell className="font-semibold text-foreground">{item.repositoryName}</TableCell>
                          <TableCell className="text-muted-foreground">{item.author}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize bg-background border-border/50 text-muted-foreground font-medium flex w-fit items-center gap-1.5">
                              {getStatusIcon(item.status)}
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getScoreBadge(item.score)}
                          </TableCell>
                          <TableCell className="text-right pr-6 text-sm text-muted-foreground">
                            {format(new Date(item.reviewedAt), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="bg-card border-dashed border-border/50 shadow-sm">
              <CardContent className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-foreground">No history found</p>
                <p className="text-sm mt-1">Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
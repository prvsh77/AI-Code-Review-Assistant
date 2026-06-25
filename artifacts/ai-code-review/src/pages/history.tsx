import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReviewHistory, getGetReviewHistoryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const [search, setSearch] = useState("");
  const { data: history, isLoading } = useGetReviewHistory({ search: search || undefined }, { query: { queryKey: getGetReviewHistoryQueryKey({ search: search || undefined }) } });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500 font-bold";
    if (score >= 70) return "text-yellow-500 font-bold";
    return "text-destructive font-bold";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">Review History</h1>
            <p className="text-muted-foreground mt-1">Search and view past AI code reviews.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by repo, PR, or author..."
              className="pl-9 bg-card border-border focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : history && history.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>PR</TableHead>
                    <TableHead>Repository</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-primary">#{item.pullRequestNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.repositoryName}</TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize flex w-fit items-center gap-1.5 bg-background">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(item.score)}>{item.score}/100</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {format(new Date(item.reviewedAt), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p>No review history found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

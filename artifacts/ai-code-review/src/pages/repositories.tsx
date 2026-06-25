import { AppLayout } from "@/components/layout/AppLayout";
import { useListRepositories, getListRepositoriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, GitPullRequest, FolderGit2, Lock, Globe, FileCode2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { SiPython, SiJavascript, SiGo, SiRust, SiTypescript } from "react-icons/si";

export default function Repositories() {
  const [search, setSearch] = useState("");
  const { data: repos, isLoading } = useListRepositories({ search: search || undefined }, { query: { queryKey: getListRepositoriesQueryKey({ search: search || undefined }) } });

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "python": return <SiPython className="text-[#3776AB]" />;
      case "javascript": return <SiJavascript className="text-[#F7DF1E]" />;
      case "typescript": return <SiTypescript className="text-[#3178C6]" />;
      case "go": return <SiGo className="text-[#00ADD8]" />;
      case "rust": return <SiRust className="text-[#DEA584]" />;
      case "java": return <FileCode2 className="text-[#b07219]" />;
      default: return <FileCode2 className="text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">Repositories</h1>
            <p className="text-muted-foreground">Manage and analyze your codebase repositories.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search repositories..."
              className="pl-9 bg-card border-border focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : repos?.map((repo) => (
            <Card key={repo.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-semibold truncate hover:text-primary transition-colors cursor-pointer">
                      {repo.name}
                    </CardTitle>
                  </div>
                  {repo.isPrivate ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="text-xs font-mono mt-1 text-muted-foreground truncate">
                  {repo.fullName}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                  {repo.description || "No description provided."}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {getLanguageIcon(repo.language)}
                    <span>{repo.language}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <GitPullRequest className="h-4 w-4" />
                    <span>{repo.openPrs} PRs</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 justify-between items-center border-t border-border mt-auto pt-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Avg Score</span>
                  <span className={`text-lg font-bold ${repo.reviewScore && repo.reviewScore >= 80 ? 'text-green-500' : repo.reviewScore && repo.reviewScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {repo.reviewScore ? `${repo.reviewScore}/100` : 'N/A'}
                  </span>
                </div>
                <Link href={`/pull-requests?repositoryId=${repo.id}`}>
                  <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                    View PRs
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {!isLoading && repos?.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg bg-card/30">
              <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium">No repositories found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

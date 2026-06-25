import { AppLayout } from "@/components/layout/AppLayout";
import { useListRepositories, getListRepositoriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, GitFork, GitPullRequest, FolderGit2, Lock, Globe, FileCode2, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { SiPython, SiJavascript, SiGo, SiRust, SiTypescript } from "react-icons/si";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Repositories() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const { data: repos, isLoading } = useListRepositories({ search: search || undefined }, { query: { queryKey: getListRepositoriesQueryKey({ search: search || undefined }) } });

  const tabs = ["All", "Python", "TypeScript", "Go", "Rust", "JavaScript"];

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

  const filteredRepos = repos?.filter(r => activeTab === "All" || r.language.toLowerCase() === activeTab.toLowerCase());

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">Repositories</h1>
            <p className="text-muted-foreground mt-1">Manage and analyze your codebase repositories.</p>
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search repositories..."
              className="pl-10 bg-card border-border focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,188,212,0.3)]" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <motion.div variants={item} key={i}>
                <Card className="bg-card/50 border-border/50 h-[220px]">
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
              </motion.div>
            ))
          ) : filteredRepos?.map((repo) => (
            <motion.div variants={item} key={repo.id} whileHover={{ y: -2 }} className="h-full">
              <Card className="h-full bg-card border-border hover:border-primary/40 transition-all duration-300 flex flex-col group shadow-sm hover:shadow-[0_4px_20px_-5px_rgba(0,188,212,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3 pt-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-background rounded-md border border-border/50 shadow-sm">
                        {getLanguageIcon(repo.language)}
                      </div>
                      <CardTitle className="text-lg font-semibold truncate hover:text-primary transition-colors cursor-pointer tracking-tight">
                        {repo.name}
                      </CardTitle>
                    </div>
                    {repo.isPrivate ? (
                      <Badge variant="outline" className="bg-background text-muted-foreground border-border/50 text-[10px] uppercase px-1.5 py-0 h-5">Private</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase px-1.5 py-0 h-5">Public</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs font-mono mt-2 text-muted-foreground truncate flex items-center gap-1">
                    {repo.fullName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-5 h-10 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitFork className="h-3.5 w-3.5" />
                      <span>{Math.floor(repo.stars / 4)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitPullRequest className="h-3.5 w-3.5 text-primary" />
                      <span>{repo.openPrs} PRs</span>
                    </div>
                    <div className="ml-auto text-[10px] opacity-70">
                      3d ago
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">AI Score</span>
                      <span className={`font-bold ${repo.reviewScore && repo.reviewScore >= 80 ? 'text-green-500' : repo.reviewScore && repo.reviewScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                        {repo.reviewScore ? `${repo.reviewScore}/100` : 'N/A'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${repo.reviewScore && repo.reviewScore >= 80 ? 'bg-green-500' : repo.reviewScore && repo.reviewScore >= 60 ? 'bg-yellow-500' : 'bg-destructive'}`} 
                        style={{ width: `${repo.reviewScore || 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-border/50 bg-muted/10 p-3 flex justify-between">
                  <Link href={`/pull-requests?repositoryId=${repo.id}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs font-medium">
                      View PRs
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 h-8 text-xs font-medium shadow-none">
                    <Play className="h-3 w-3 mr-1.5 fill-current" /> Analyze
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          {!isLoading && filteredRepos?.length === 0 && (
            <motion.div variants={item} className="col-span-full py-16 text-center border border-dashed border-border/50 rounded-xl bg-card/20">
              <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No repositories found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search criteria or filter.</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
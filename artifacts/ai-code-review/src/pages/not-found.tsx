import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalSquare, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden font-sans">
      {/* Animated Particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-primary rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: Math.random()
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [null, Math.random(), 0]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-lg flex flex-col items-center relative z-10"
      >
        <div className="relative">
          <TerminalSquare className="h-24 w-24 text-primary relative z-10" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-primary rounded-lg blur-2xl z-0" 
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-[120px] font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-blue-600 leading-none drop-shadow-sm">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase mt-4">Page Not Found</h2>
        </div>
        
        <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
          The codebase route you requested has been refactored, deleted, or never existed in the first place.
        </p>
        
        <div className="pt-8">
          <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-medium shadow-[0_0_20px_rgba(0,188,212,0.3)] hover:scale-105 transition-transform">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
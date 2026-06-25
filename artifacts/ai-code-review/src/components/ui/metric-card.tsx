import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: "primary" | "green" | "red" | "yellow" | "blue";
  data?: any[]; // For sparkline
}

const colorMap = {
  primary: "text-primary bg-primary/10 border-primary/20",
  green: "text-green-500 bg-green-500/10 border-green-500/20",
  red: "text-red-500 bg-red-500/10 border-red-500/20",
  yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

const strokeMap = {
  primary: "hsl(var(--primary))",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  blue: "#3b82f6",
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "primary",
  data = Array.from({ length: 10 }).map(() => ({ value: Math.random() * 100 })),
}: MetricCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="h-full"
    >
      <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors shadow-sm relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-full ${colorMap[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            {trend !== undefined && (
              <div
                className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  isPositive
                    ? "text-green-500 bg-green-500/10"
                    : isNegative
                    ? "text-red-500 bg-red-500/10"
                    : "text-muted-foreground bg-muted"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : isNegative ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : null}
                {trend > 0 ? "+" : ""}
                {trend}%
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </h3>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </div>
            {trendLabel && (
              <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={strokeMap[color]}
                  strokeWidth={2}
                  fill={`url(#gradient-${color})`}
                  isAnimationActive={false}
                />
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeMap[color]} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={strokeMap[color]} stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

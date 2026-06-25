import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ScoreRing({ score, size = "md", label }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const sizeMap = {
    sm: { width: 64, strokeWidth: 4, text: "text-lg", labelText: "text-xs" },
    md: { width: 96, strokeWidth: 6, text: "text-2xl", labelText: "text-sm" },
    lg: { width: 128, strokeWidth: 8, text: "text-4xl", labelText: "text-base" },
  };

  const currentSize = sizeMap[size];
  const radius = (currentSize.width - currentSize.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return "#22c55e"; // green-500
    if (s >= 70) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: currentSize.width, height: currentSize.width }}
      >
        <svg
          width={currentSize.width}
          height={currentSize.width}
          viewBox={`0 0 ${currentSize.width} ${currentSize.width}`}
          className="transform -rotate-90"
        >
          <circle
            cx={currentSize.width / 2}
            cy={currentSize.width / 2}
            r={radius}
            fill="transparent"
            stroke="hsl(var(--muted))"
            strokeWidth={currentSize.strokeWidth}
          />
          <motion.circle
            cx={currentSize.width / 2}
            cy={currentSize.width / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={currentSize.strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`font-bold tracking-tighter ${currentSize.text}`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className={`mt-2 font-medium text-muted-foreground ${currentSize.labelText}`}>
          {label}
        </span>
      )}
    </div>
  );
}

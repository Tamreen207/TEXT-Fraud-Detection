"use client";

import { motion } from "framer-motion";

interface RiskMeterProps {
  score: number;
  level: string;
}

export function RiskMeter({ score, level }: RiskMeterProps) {
  const getColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "text-danger shadow-glow-danger";
      case "HIGH":
        return "text-warning shadow-glow-warning";
      default:
        return "text-safe shadow-glow-safe";
    }
  };

  const getBorderColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "border-danger/60 bg-danger/5";
      case "HIGH":
        return "border-warning/60 bg-warning/5";
      default:
        return "border-safe/60 bg-safe/5";
    }
  };

  const getBackgroundGradient = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "from-danger/10 to-red-500/5";
      case "HIGH":
        return "from-warning/10 to-orange-500/5";
      default:
        return "from-safe/10 to-green-500/5";
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px 0 rgba(${level === "CRITICAL" ? "239,68,68" : level === "HIGH" ? "255,159,64" : "34,197,94"}/0.3)`,
            `0 0 40px 10px rgba(${level === "CRITICAL" ? "239,68,68" : level === "HIGH" ? "255,159,64" : "34,197,94"}/0.1)`,
            `0 0 20px 0 rgba(${level === "CRITICAL" ? "239,68,68" : level === "HIGH" ? "255,159,64" : "34,197,94"}/0.3)`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full`}
      />

      {/* Main Meter Circle */}
      <div
        className={`relative w-56 h-56 rounded-full border-8 ${getBorderColor(level)} flex flex-col items-center justify-center bg-gradient-to-br ${getBackgroundGradient(level)} backdrop-blur-sm transition-all duration-500 shadow-2xl`}
      >
        {/* Inner Decorative Circle */}
        <div className="absolute inset-4 rounded-full border border-white/10 dark:border-white/5"></div>

        {/* Score Number */}
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className={`text-7xl font-display font-bold ${getColor(level).split(" ")[0]} ${getColor(level).includes("shadow") ? getColor(level).split(" ").slice(1).join(" ") : ""} relative z-10`}
        >
          {score}
        </motion.span>

        {/* Label */}
        {(level === "CRITICAL" || level === "HIGH") && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-3 relative z-10"
          >
            {level === "CRITICAL" ? "⚠️ Critical Risk" : "⚡ High Risk"}
          </motion.span>
        )}

        {/* Progress Ring Background */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/20"
            opacity="0.5"
          />

          {/* Animated Progress Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="2"
            className={getColor(level).split(" ")[0]}
            strokeDasharray={`${Number.isNaN(score) ? 0 : (score / 100) * 283} 283`}
            initial={{ strokeDasharray: "0 283" }}
            animate={{
              strokeDasharray: `${Number.isNaN(score) ? 0 : (score / 100) * 283} 283`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Animated Pulse Ring (Outer) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full border-2 ${getBorderColor(level).split(" ")[0]} opacity-50`}
      />
    </div>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, trendUp, description, className }: StatsCardProps) {
  return (
    <div className={cn("bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 font-display">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          {icon}
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-4 flex items-center text-xs">
          {trend && (
            <span className={cn("font-bold mr-2", trendUp ? "text-green-500" : "text-red-500")}>
              {trend}
            </span>
          )}
          {description && <span className="text-muted-foreground font-medium">{description}</span>}
        </div>
      )}
    </div>
  );
}

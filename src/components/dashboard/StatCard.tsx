import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "primary" | "accent" | "warning";
  trend?: { value: number; label: string };
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  accent: "bg-accent/5 border-accent/20",
  warning: "bg-warning/5 border-warning/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "gradient-primary text-primary-foreground",
  accent: "gradient-accent text-accent-foreground",
  warning: "bg-warning text-warning-foreground",
};

export default function StatCard({ title, value, icon: Icon, description, variant = "default", trend }: StatCardProps) {
  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-md hover:-translate-y-0.5`}>
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? "text-success" : "text-destructive"}`}>
              {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </div>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

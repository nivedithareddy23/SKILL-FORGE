import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "primary" | "accent" | "warning";
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

export default function StatCard({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) {
  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-md`}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

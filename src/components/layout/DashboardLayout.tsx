import { cn } from "@/lib/utils";
import { DashboardNav } from "./DashboardNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, title, subtitle, actions, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="ml-64 min-h-screen">
        {/* Background effects */}
        <div className="fixed inset-0 ml-64 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 gradient-radial opacity-30" />
        </div>

        <div className={cn("relative z-10 p-8", className)}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-4">{actions}</div>}
          </div>

          {/* Content */}
          {children}
        </div>
      </main>
    </div>
  );
}

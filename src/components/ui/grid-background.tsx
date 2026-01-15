import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showRadial?: boolean;
}

export function GridBackground({ children, className, showRadial = true }: GridBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen bg-background", className)}>
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Radial gradient overlay */}
      {showRadial && (
        <div className="absolute inset-0 gradient-radial" />
      )}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'primary' | 'secondary' | 'accent';
  hover?: boolean;
  onClick?: () => void;
}

export function GlowCard({ children, className, glowColor = 'primary', hover = true, onClick }: GlowCardProps) {
  const glowStyles = {
    primary: 'hover:shadow-[0_0_30px_hsl(175_80%_50%/0.3)]',
    secondary: 'hover:shadow-[0_0_30px_hsl(260_60%_55%/0.3)]',
    accent: 'hover:shadow-[0_0_30px_hsl(200_80%_60%/0.3)]',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6",
        "transition-all duration-300 ease-out",
        hover && "hover:-translate-y-1",
        hover && glowStyles[glowColor],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

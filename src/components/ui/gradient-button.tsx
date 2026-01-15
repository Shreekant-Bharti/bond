import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', glow = true, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
      secondary: "bg-gradient-to-r from-secondary to-accent text-secondary-foreground",
      outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold",
          "transition-all duration-300 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          glow && "hover:shadow-[0_0_30px_hsl(175_80%_50%/0.4)]",
          "active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";

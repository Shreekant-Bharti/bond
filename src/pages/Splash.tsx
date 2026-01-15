import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => navigate("/landing"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl animate-pulse-glow" />
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Logo */}
        <div className="mb-8 inline-flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-glow">
              <span className="text-5xl font-bold text-primary-foreground">B</span>
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 to-secondary/30 blur-xl -z-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-foreground mb-4 glow-text">
          BondFi
        </h1>

        {/* Tagline */}
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Fractional Government Bonds on Blockchain
        </p>

        {/* Loading indicator */}
        <div className="mt-12 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

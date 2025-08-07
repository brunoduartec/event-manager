import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    let base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 h-10 ";
    if (variant === "outline") base += "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
    else if (variant === "destructive") base += "bg-red-600 text-white hover:bg-red-700";
    else base += "bg-primary text-primary-foreground hover:bg-primary/90";
    return (
      <button ref={ref} className={base + " " + className} {...props} />
    );
  }
);
Button.displayName = "Button";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "destructive";
  size?: "sm" | "md" | "icon";
};

export function Button({
  className = "",
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default:
      "bg-black text-white hover:bg-black/90 border-transparent dark:bg-white dark:text-black dark:hover:bg-white/90",
    ghost:
      "bg-transparent text-foreground hover:bg-muted border-transparent",
    destructive:
      "bg-red-600 text-white hover:bg-red-600/90 border-transparent",
  };
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-9 px-3",
    md: "h-10 px-4",
    icon: "h-10 w-10 p-0",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

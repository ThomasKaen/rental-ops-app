// frontend/src/components/ui/card.tsx
import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

export function Card({ className = "", ...props }: DivProps) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm " +
        className
      }
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: DivProps) {
  return (
    <div
      className={"flex flex-col gap-1 border-b border-slate-100 px-4 py-3 " + className}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }: HeadingProps) {
  return (
    <h3
      className={"text-base font-semibold leading-tight " + className}
      {...props}
    />
  );
}

export function CardDescription({ className = "", ...props }: ParagraphProps) {
  return (
    <p
      className={"text-xs text-slate-500 " + className}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: DivProps) {
  return (
    <div className={"px-4 py-3 " + className} {...props} />
  );
}

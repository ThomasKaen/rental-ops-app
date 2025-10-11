import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPrimitive.Content
          className={`w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl ${className}`}
          {...props}
        />
      </div>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />;
}

export function DialogTitle({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

export function DialogDescription({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    />
  );
}

export function DialogFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className}`}
      {...props}
    />
  );
}

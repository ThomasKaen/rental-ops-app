type ToastArgs = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description }: ToastArgs) => {
      const parts = [title, description].filter(Boolean);
      if (parts.length === 0) return;
      // Simple fallback toast — replace with real UI when ready
      alert(parts.join("\n\n"));
      // Also log to console for dev
      console.log("[toast]", { title, description });
    },
  };
}

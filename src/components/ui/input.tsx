import { cn } from "@/lib/cn";

const baseClass =
  "h-11 w-full rounded-xl border border-line bg-paper/50 px-3.5 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-primary";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseClass, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(baseClass, "h-auto min-h-28 py-3", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(baseClass, "appearance-none", className)} {...props} />;
}
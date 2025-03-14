import { cn } from "@/src/client/shared/shadcn/lib/utils";

export function PageLayout({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full p-2 md:p-4", className)} {...props}>
      {children}
    </div>
  );
}

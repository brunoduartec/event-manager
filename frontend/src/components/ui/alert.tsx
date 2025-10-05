import * as React from "react";

export function Alert({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={"relative w-full rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive shadow-sm flex items-center gap-2 " + className} {...props} />
  );
}

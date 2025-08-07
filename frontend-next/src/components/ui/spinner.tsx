import * as React from "react";

export function Spinner({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={"inline-block animate-spin rounded-full border-2 border-t-transparent border-gray-400 h-5 w-5 " + className} {...props} />
  );
}

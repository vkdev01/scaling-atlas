import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-start justify-center px-4">
      <span className="num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        404
      </span>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        No such lesson
      </h1>
      <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
        That URL does not match anything in the course. The lessons live under
        /learn/.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-5">
        <Link href="/">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the course
        </Link>
      </Button>
    </div>
  );
}

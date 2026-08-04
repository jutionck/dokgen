import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  buildHref: (page: number) => string;
  className?: string;
  onPrevHover?: () => void;
  onNextHover?: () => void;
}

/**
 * Navigasi halaman reusable — server-safe (pakai <Link>).
 * Menampilkan "Menampilkan x–y dari z" + tombol Sebelumnya/Berikutnya.
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize = 10,
  buildHref,
  className,
  onPrevHover,
  onNextHover,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total ?? page * pageSize);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-6", className)}>
      <p className="text-xs text-muted-foreground">
        {total !== undefined ? (
          <>
            Menampilkan{" "}
            <span className="font-medium text-foreground">
              {start}–{end}
            </span>{" "}
            dari <span className="font-medium text-foreground">{total}</span>
          </>
        ) : (
          <>
            Halaman <span className="font-medium text-foreground">{page}</span> dari {totalPages}
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm" onMouseEnter={onPrevHover}>
            <Link href={buildHref(page - 1)} prefetch={true}>
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </Button>
        )}
        {page < totalPages ? (
          <Button asChild variant="outline" size="sm" onMouseEnter={onNextHover}>
            <Link href={buildHref(page + 1)} prefetch={true}>
              Berikutnya <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Berikutnya <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

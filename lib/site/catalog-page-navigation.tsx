import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "~/components/ui/button";
import {
  getCatalogPageHref,
  getCatalogPageNumbers,
} from "~/lib/site/catalog-pagination";
import { cn } from "~/lib/utils";

type CatalogPageNavigationProps = {
  basePath: string;
  currentPage: number;
  pageCount: number;
  label: string;
  className?: string;
  onPageSelect?: (pageNumber: number) => void;
};

export function CatalogPageNavigation({
  basePath,
  currentPage,
  pageCount,
  label,
  className,
  onPageSelect,
}: CatalogPageNavigationProps): ReactNode {
  if (pageCount <= 1) {
    return null;
  }

  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === pageCount;

  return (
    <nav
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      <PageControl
        ariaLabel="Previous page"
        basePath={basePath}
        disabled={isFirstPage}
        onPageSelect={onPageSelect}
        pageNumber={previousPage}
      >
        <ChevronLeftIcon aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Previous</span>
      </PageControl>

      <div className="flex items-center gap-1">
        {getCatalogPageNumbers(pageCount).map((pageNumber) => {
          const isActive = pageNumber === currentPage;

          return (
            <PageControl
              ariaCurrent={isActive ? "page" : undefined}
              ariaLabel={`Page ${pageNumber}`}
              basePath={basePath}
              key={pageNumber}
              onPageSelect={onPageSelect}
              pageNumber={pageNumber}
              variant={isActive ? "default" : "outline"}
            >
              {pageNumber}
            </PageControl>
          );
        })}
      </div>

      <PageControl
        ariaLabel="Next page"
        basePath={basePath}
        disabled={isLastPage}
        onPageSelect={onPageSelect}
        pageNumber={nextPage}
      >
        <span className="sr-only sm:not-sr-only">Next</span>
        <ChevronRightIcon aria-hidden="true" />
      </PageControl>
    </nav>
  );
}

function PageControl({
  ariaCurrent,
  ariaLabel,
  basePath,
  children,
  disabled,
  onPageSelect,
  pageNumber,
  variant = "outline",
}: {
  ariaCurrent?: "page";
  ariaLabel: string;
  basePath: string;
  children: ReactNode;
  disabled?: boolean;
  onPageSelect?: (pageNumber: number) => void;
  pageNumber: number;
  variant?: "default" | "outline";
}) {
  const className = "min-w-9 rounded-lg";

  if (onPageSelect) {
    return (
      <Button
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        className={className}
        disabled={disabled}
        onClick={() => onPageSelect(pageNumber)}
        type="button"
        variant={variant}
      >
        {children}
      </Button>
    );
  }

  if (disabled) {
    return (
      <Button
        aria-disabled="true"
        aria-label={ariaLabel}
        className={className}
        disabled
        variant={variant}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button asChild className={className} variant={variant}>
      <Link
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        href={getCatalogPageHref(basePath, pageNumber)}
      >
        {children}
      </Link>
    </Button>
  );
}

export const catalogItemsPerPage = 6;

export function getCatalogPageCount(items: readonly unknown[]) {
  return Math.max(1, Math.ceil(items.length / catalogItemsPerPage));
}

export function getCatalogPageItems<T>(
  items: readonly T[],
  pageNumber: number,
) {
  const pageIndex = Math.max(0, pageNumber - 1);
  const start = pageIndex * catalogItemsPerPage;

  return items.slice(start, start + catalogItemsPerPage);
}

export function getCatalogPageHref(basePath: string, pageNumber: number) {
  return pageNumber <= 1 ? basePath : `${basePath}/page/${pageNumber}`;
}

export function getCatalogPageNumbers(pageCount: number) {
  return Array.from({ length: pageCount }, (_, index) => index + 1);
}

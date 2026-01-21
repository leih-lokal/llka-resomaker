import { Suspense } from "react";
import { Catalog } from "@/components/catalog/catalog";
import { ItemGridSkeleton } from "@/components/catalog/item-grid";

export default function Home() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog />
    </Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-5 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-72 bg-muted rounded animate-pulse" />
      </div>
      <ItemGridSkeleton count={24} />
    </div>
  );
}

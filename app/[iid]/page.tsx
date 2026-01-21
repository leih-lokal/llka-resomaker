"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ItemDetail } from "@/components/item/item-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { getItemByIid } from "@/lib/api/items";
import { Item } from "@/lib/types/item";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function ItemPage() {
  const params = useParams();
  const iid = parseInt(params.iid as string, 10);

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (isNaN(iid)) {
      setNotFoundState(true);
      setIsLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        const fetchedItem = await getItemByIid(iid);
        if (fetchedItem) {
          setItem(fetchedItem);
        } else {
          setNotFoundState(true);
        }
      } catch {
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [iid]);

  if (notFoundState) {
    notFound();
  }

  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (!item) {
    return null;
  }

  const name = stripHtml(item.name);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: `#${item.iid} ${name}` },
        ]}
      />
      <ItemDetail item={item} />
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4 mt-2" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-px w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-16 w-24" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

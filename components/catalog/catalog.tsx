"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "./search-bar";
import { ItemGrid, ItemGridSkeleton } from "./item-grid";
import { Pagination } from "./pagination";
import { getItems } from "@/lib/api/items";
import { Item } from "@/lib/types/item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 24;

interface CatalogProps {
  initialItems?: Item[];
}

export function Catalog({ initialItems }: CatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const initialSearch = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialAvailable = searchParams.get("all") !== "1";

  const [items, setItems] = useState<Item[]>(initialItems || []);
  const [search, setSearch] = useState(initialSearch);
  const [availableOnly, setAvailableOnly] = useState(initialAvailable);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialItems);
  const [error, setError] = useState<string | null>(null);

  // Update URL params
  const updateUrl = useCallback(
    (newSearch: string, newPage: number, newAvailableOnly: boolean) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("q", newSearch);
      if (newPage > 1) params.set("page", newPage.toString());
      if (!newAvailableOnly) params.set("all", "1");

      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "/", { scroll: false });
    },
    [router]
  );

  const fetchItems = useCallback(
    async (searchTerm: string, showAvailableOnly: boolean, pageNum: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getItems(
          pageNum,
          ITEMS_PER_PAGE,
          searchTerm || undefined,
          showAvailableOnly
        );
        setItems(response.items);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Fehler beim Laden der Gegenstände"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search - reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchItems(search, availableOnly, 1);
      updateUrl(search, 1, availableOnly);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, availableOnly, fetchItems, updateUrl]);

  // Page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchItems(search, availableOnly, newPage);
    updateUrl(search, newPage, availableOnly);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial load from URL params
  useEffect(() => {
    if (!initialItems) {
      fetchItems(initialSearch, initialAvailable, initialPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailableOnly = () => {
    setAvailableOnly((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {availableOnly ? "Verfügbare Gegenstände" : "Alle Gegenstände"}
          </h1>
          <p className="text-muted-foreground">
            {totalItems > 0
              ? `${totalItems} Gegenstände gefunden`
              : "Wählen Sie Gegenstände aus und reservieren Sie sie zur Abholung."}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-72">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Gegenstand suchen..."
            />
          </div>
          <Button
            variant={availableOnly ? "outline" : "secondary"}
            size="icon"
            onClick={toggleAvailableOnly}
            title={availableOnly ? "Alle anzeigen" : "Nur verfügbare anzeigen"}
          >
            {availableOnly ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {!availableOnly && (
        <p className="text-sm text-muted-foreground">
          Es werden auch nicht verfügbare Gegenstände angezeigt.
        </p>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems(search, availableOnly, page)}
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? <ItemGridSkeleton count={ITEMS_PER_PAGE} /> : <ItemGrid items={items} />}

      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

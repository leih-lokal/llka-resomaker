import { fetchApi } from "./client";
import { Item, ItemsResponse } from "@/lib/types/item";
import { config } from "@/lib/config";

export async function getItems(
  page: number = 1,
  perPage: number = 30,
  search?: string,
  availableOnly: boolean = true
): Promise<ItemsResponse> {
  const filters: string[] = [];

  if (availableOnly) {
    filters.push('status="instock"');
  } else {
    // Exclude deleted items
    filters.push('status!="deleted"');
  }

  if (search) {
    const searchTerm = search.replace(/"/g, '\\"');
    filters.push(
      `(name~"${searchTerm}" || description~"${searchTerm}" || category~"${searchTerm}" || synonyms~"${searchTerm}")`
    );
  }

  const params = new URLSearchParams({
    filter: filters.join(" && "),
    sort: config.defaults.sort,
    page: page.toString(),
    perPage: perPage.toString(),
  });

  return fetchApi<ItemsResponse>(
    `/api/collections/item_public/records?${params.toString()}`
  );
}

export async function getItem(id: string): Promise<Item> {
  return fetchApi<Item>(`/api/collections/item_public/records/${id}`);
}

export async function getItemByIid(iid: number): Promise<Item | null> {
  const params = new URLSearchParams({
    filter: `iid=${iid}`,
    perPage: "1",
  });

  const response = await fetchApi<ItemsResponse>(
    `/api/collections/item_public/records?${params.toString()}`
  );

  return response.items.length > 0 ? response.items[0] : null;
}

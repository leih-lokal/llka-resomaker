"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export function CartButton() {
  const { items, setIsOpen } = useCart();
  const itemCount = items.length;

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={() => setIsOpen(true)}
      aria-label="Warenkorb öffnen"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {itemCount}
        </span>
      )}
    </Button>
  );
}

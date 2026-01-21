import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Gegenstand nicht gefunden</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Der gesuchte Gegenstand existiert nicht oder wurde entfernt.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </Button>
    </div>
  );
}

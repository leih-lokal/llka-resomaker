import { formatOpeningHours } from "@/lib/constants/opening-hours";
import { config } from "@/lib/config";

export function Footer() {
  const hours = formatOpeningHours();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold">{config.brand.name}</h3>
            <p className="text-sm text-muted-foreground">
              {config.brand.tagline}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Öffnungszeiten</h3>
            <dl className="space-y-1 text-sm">
              {hours.map(({ day, hours: time }) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{day}</dt>
                  <dd
                    className={
                      time === "Geschlossen"
                        ? "text-muted-foreground"
                        : "font-medium"
                    }
                  >
                    {time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {config.brand.name}</p>
        </div>
      </div>
    </footer>
  );
}

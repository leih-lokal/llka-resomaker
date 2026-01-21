import { z } from "zod";

export const reservationSchema = z.object({
  customer_email: z
    .string()
    .min(1, "E-Mail ist erforderlich")
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  pickup: z.string().min(1, "Bitte wählen Sie einen Abholtermin"),
  comments: z.string().optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

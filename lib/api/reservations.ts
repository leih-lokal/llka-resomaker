import { fetchApi } from "./client";
import {
  ReservationRequest,
  ReservationResponse,
} from "@/lib/types/reservation";

export async function createReservation(
  data: ReservationRequest
): Promise<ReservationResponse> {
  return fetchApi<ReservationResponse>(
    "/api/collections/reservation/records",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

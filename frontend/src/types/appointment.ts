import { Doctor } from "./doctor";

export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: AppointmentStatus;
  doctor: Doctor;
}

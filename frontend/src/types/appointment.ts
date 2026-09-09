import { Doctor } from "./doctor";

export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  patient?: { fullName: string };
}

export interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: AppointmentStatus;
  doctor: Doctor;
  review: Review | null;
}

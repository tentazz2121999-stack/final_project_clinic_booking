export interface Specialty {
  id: number;
  name: string;
  description: string | null;
}

export interface Availability {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TimeBlock {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export interface Doctor {
  id: number;
  bio: string | null;
  experienceYears: number;
  consultationFee: string | number;
  slotDurationMinutes: number;
  avgRating: string | number;
  reviewCount: number;
  user: {
    id: number;
    fullName: string;
    phone: string | null;
  };
  specialty: Specialty;
  availabilities?: Availability[];
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

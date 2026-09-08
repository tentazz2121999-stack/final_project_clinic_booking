export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

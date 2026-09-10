export interface TopDoctor {
  doctorId: number;
  appointmentCount: number;
  fullName?: string;
  specialty?: string;
}

export interface StatsOverview {
  totalDoctors: number;
  totalPatients: number;
  totalSpecialties: number;
  appointmentsToday: number;
  totalAppointments: number;
  appointmentsByStatus: Record<string, number>;
  topDoctors: TopDoctor[];
}

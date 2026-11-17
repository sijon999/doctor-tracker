export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  age: number;
  gender?: "male" | "female" | "other";
  condition: string;
  doctor: Doctor | string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Appointment {
  _id: string;
  patient: Patient | string;
  doctor: Doctor | string;
  date: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

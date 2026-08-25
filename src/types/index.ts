export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  phone: string;
  createdAt: any;
  updatedAt: any;
}

export interface EquipmentItem {
  id: string;
  name: string;
  icon: string;
  available: boolean;
  quantity: number;
  description: string;
}

export interface ReservedEquipment {
  id: string;
  name: string;
  quantity: number;
}

export type EventType = 'Académico' | 'Cultural' | 'Administrativo' | 'Externo';
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  equipment: ReservedEquipment[];
  attendees: number;
  additionalNotes: string;
  status: ReservationStatus;
  adminNotes?: string;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any | null;
  rejectedAt?: any | null;
  notificationSent: {
    confirmation: boolean;
    reminder: boolean;
    dailyReport: boolean;
  };
}

export interface DailyReport {
  id: string; // YYYY-MM-DD
  date: string;
  reservations: string[];
  pdfUrl: string;
  sentTo: string[];
  createdAt: any;
}

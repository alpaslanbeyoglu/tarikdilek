export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type UserRole = 'admin' | 'staff' | null;

export interface AuthUser {
  role: 'admin' | 'staff';
  barberId?: string;
  name: string;
}

export interface Barber {
  id: string;
  name: string;
  title: string;
  phone: string;
  avatar: string;
  rating: number;
  experienceYears: number;
  active: boolean;
  pin?: string; // Individual staff PIN
  bio?: string;
  servicesOffered: string[]; // Service IDs
  workingHours: {
    start: string; // "09:00"
    end: string;   // "20:00"
    lunchStart: string; // "13:00"
    lunchEnd: string;   // "14:00"
  };
  daysOff: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface Service {
  id: string;
  name: string;
  category: 'Saç' | 'Sakal' | 'Kombin' | 'Bakım & Spa';
  durationMinutes: number;
  price: number;
  description: string;
  popular?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  visitCount: number;
  totalSpent: number;
  lastVisitDate?: string;
  vipStatus?: boolean;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  barberId: string;
  serviceIds: string[];
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  totalDuration: number; // minutes
  totalPrice: number; // TRY
  status: AppointmentStatus;
  notes?: string;
  source: 'online' | 'manual';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  appointmentId?: string;
  type: 'new_booking' | 'cancellation' | 'status_change' | 'system';
}

export interface BusinessSettings {
  shopName: string;
  phone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  managerPhone: string;
  managerPin: string; // Master Manager Password: '14611461'
  autoConfirmOnline: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
  slotIntervalMinutes: number;
}

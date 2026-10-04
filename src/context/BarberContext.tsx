import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Barber,
  Service,
  Customer,
  Appointment,
  AppointmentStatus,
  NotificationItem,
  BusinessSettings,
  UserRole,
  AuthUser,
} from '../types';
import {
  INITIAL_BARBERS,
  INITIAL_SERVICES,
  INITIAL_CUSTOMERS,
  INITIAL_APPOINTMENTS,
  INITIAL_SETTINGS,
} from '../data/seedData';
import {
  sendInstantNotification,
  playNotificationSound,
} from '../services/notificationService';
import { doc, setDoc, deleteDoc, onSnapshot, getDocs, getDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db, appointmentsCol, barbersCol, customersCol, servicesCol, settingsDocRef } from '../services/firebaseFirestore';
import { formatLocalDateToISO, parseISODateToLocal } from '../utils/dateHelper';

function cleanFirestoreData(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanFirestoreData);
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanFirestoreData(value);
    }
  }
  return cleaned;
}

interface BarberContextType {
  barbers: Barber[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  settings: BusinessSettings;
  activeMode: 'manager' | 'customer';
  setActiveMode: (mode: 'manager' | 'customer') => void;
  // Auth & Role State
  currentUser: AuthUser | null;
  currentUserRole: UserRole;
  loggedInBarberId: string | null;
  loginAsManager: (pin: string) => boolean;
  loginAsStaff: (barberId: string, pin: string) => boolean;
  logout: () => void;
  // Filters
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedBarberFilter: string;
  setSelectedBarberFilter: (id: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  // Methods
  getAvailableSlots: (barberId: string, date: string, durationMinutes: number) => string[];
  bookAppointment: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    barberId: string;
    serviceIds: string[];
    date: string;
    startTime: string;
    notes?: string;
    source?: 'online' | 'manual';
  }) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateAppointment: (updated: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addBarber: (barber: Omit<Barber, 'id'>) => void;
  updateBarber: (barber: Barber) => void;
  deleteBarber: (id: string) => void;
  toggleBarberActive: (id: string) => void;
  // Service Management
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'visitCount' | 'totalSpent'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  triggerTestPushNotification: () => Promise<void>;
  refreshAppointments: () => Promise<boolean>;
  resetToDefaultData: () => void;
  // Sync & Loading State
  isLoading: boolean;
  isOnlineSyncing: boolean;
  syncError: string | null;
  clearSyncError: () => void;
}

const BarberContext = createContext<BarberContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = 'tarik_dilek_broadcast_channel';

// Helper to convert time "HH:MM" to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper to convert minutes from midnight to "HH:MM"
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const BarberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage state keys
  const [barbers, setBarbers] = useState<Barber[]>(() => {
    const saved = localStorage.getItem('barber_barbers');
    if (saved) {
      try {
        const parsed: Barber[] = JSON.parse(saved);
        const filtered = parsed.filter((b) => b.id === 'b1' || (!['b2', 'b3', 'b4'].includes(b.id) && b.name !== 'Ahmet Yılmaz'));
        if (filtered.length > 0) {
          return filtered.map((b) => ({
            ...b,
            name: b.id === 'b1' ? 'Tarık Dilek' : b.name,
            title: b.id === 'b1' ? 'Kurucu & Baş Berber' : b.title,
            pin: b.pin || (b.id === 'b1' ? '1461' : '1234'),
          }));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_BARBERS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('barber_services');
    if (saved) {
      try {
        const parsed: Service[] = JSON.parse(saved);
        if (parsed.some((s) => s.id === 's-sac-kesim')) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_SERVICES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('barber_customers');
    if (saved) {
      try {
        const parsed: Customer[] = JSON.parse(saved);
        const filtered = parsed.filter((c) => !['c1', 'c2', 'c3', 'c4', 'c5'].includes(c.id));
        return filtered;
      } catch {
        // fallback
      }
    }
    return INITIAL_CUSTOMERS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('barber_appointments');
    if (saved) {
      try {
        const parsed: Appointment[] = JSON.parse(saved);
        const filtered = parsed.filter((a) => !['apt-1', 'apt-2', 'apt-3', 'apt-4', 'apt-5', 'apt-6'].includes(a.id));
        return filtered;
      } catch {
        // fallback
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('barber_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        shopName: 'Tarık Dilek',
        address: 'Göktürk Caddesi No:47 C, Eyüp / İstanbul',
        phone: '0531 660 52 30',
        managerPhone: '0531 660 52 30',
        managerPin: parsed.managerPin === '14611461' ? '1461' : (parsed.managerPin || '1461'),
        coordinates: { lat: 41.1825, lng: 28.8935 },
      };
    }
    return INITIAL_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('barber_notifications');
    if (saved) {
      try {
        const parsed: NotificationItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const clean: NotificationItem[] = [];
          parsed.forEach((item, idx) => {
            const rawId = item.id || `notif-${idx}`;
            const uniqueId = !seen.has(rawId)
              ? rawId
              : `${rawId}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
            seen.add(uniqueId);
            clean.push({ ...item, id: uniqueId });
          });
          return clean;
        }
      } catch (err) {
        console.warn('Failed to parse saved notifications', err);
      }
    }
    return [
      {
        id: 'notif-system-init-1',
        title: 'Sistem Başlatıldı',
        body: 'Tarık Dilek Berber Yönetim Sistemi aktif ve bildirimler hazır.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'system',
      },
    ];
  });

  // Auth & Role State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('tarik_dilek_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeMode, setActiveMode] = useState<'manager' | 'customer'>(() => {
    return currentUser ? 'manager' : 'customer';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return formatLocalDateToISO(new Date());
  });

  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>(() => {
    if (currentUser?.role === 'staff' && currentUser.barberId) {
      return currentUser.barberId;
    }
    return 'all';
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const currentUserRole: UserRole = currentUser?.role || null;
  const loggedInBarberId: string | null = currentUser?.barberId || null;

  // Loading & Sync Debugging States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnlineSyncing, setIsOnlineSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  // Persist session
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('tarik_dilek_auth_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('tarik_dilek_auth_user');
    }
  }, [currentUser]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('barber_barbers', JSON.stringify(barbers));
  }, [barbers]);

  useEffect(() => {
    localStorage.setItem('barber_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('barber_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('barber_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('barber_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Login as Master Manager (Password: 1461)
  const loginAsManager = useCallback((pin: string): boolean => {
    const validPin = settings.managerPin || '1461';
    if (pin === '1461' || pin === '14611461' || pin === validPin) {
      const user: AuthUser = {
        role: 'admin',
        name: 'Tarık Dilek (Salon Yöneticisi)',
      };
      setCurrentUser(user);
      setActiveMode('manager');
      setSelectedBarberFilter('all');
      return true;
    }
    return false;
  }, [settings.managerPin]);

  // Login as Staff / Stylist
  const loginAsStaff = useCallback((barberId: string, pin: string): boolean => {
    const targetBarber = barbers.find((b) => b.id === barberId);
    if (!targetBarber) return false;

    // Check staff PIN, with fallback to 1234 or master 1461
    const staffPin = targetBarber.pin || '1234';
    if (pin === staffPin || pin === '1461' || pin === '14611461' || pin === '1234') {
      const user: AuthUser = {
        role: 'staff',
        barberId: targetBarber.id,
        name: targetBarber.name,
      };
      setCurrentUser(user);
      setActiveMode('manager');
      setSelectedBarberFilter(targetBarber.id); // Locked to self
      return true;
    }
    return false;
  }, [barbers]);

  // Logout
  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveMode('customer');
    setSelectedBarberFilter('all');
  }, []);

  // Real-time Firestore sync across devices for all entities with try-catch and debug indicators
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    try {
      // 1. Appointments
      const unsubApts = onSnapshot(
        appointmentsCol,
        (snapshot) => {
          try {
            const cloudApts: Appointment[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Appointment;
              if (data && data.id) cloudApts.push(data);
            });
            setAppointments((prev) => {
              const map = new Map<string, Appointment>();
              prev.forEach((a) => map.set(a.id, a));
              cloudApts.forEach((a) => map.set(a.id, a));
              return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            });
            setIsOnlineSyncing(true);
            setIsLoading(false);
            setSyncError(null);
          } catch (err: any) {
            console.error('Error parsing appointments snapshot:', err);
            setSyncError(`Randevular işlenirken hata: ${err?.message || err}`);
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Firestore appointments sync error:', err);
          setSyncError(`Randevu senkronizasyon hatası: ${err?.message || 'Bağlantı hatası'}`);
          setIsLoading(false);
        }
      );
      unsubs.push(unsubApts);

      // 2. Barbers
      const unsubBarbers = onSnapshot(
        barbersCol,
        (snapshot) => {
          try {
            const cloudBarbers: Barber[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Barber;
              if (data && data.id) cloudBarbers.push(data);
            });
            if (cloudBarbers.length > 0) {
              setBarbers(cloudBarbers);
            } else {
              INITIAL_BARBERS.forEach((b) => {
                setDoc(doc(db, 'tarik_dilek_barbers', b.id), cleanFirestoreData(b)).catch((e) =>
                  console.error('Seed barber error:', e)
                );
              });
            }
            setIsOnlineSyncing(true);
            setIsLoading(false);
          } catch (err: any) {
            console.error('Error parsing barbers snapshot:', err);
            setSyncError(`Personel verisi işlenirken hata: ${err?.message || err}`);
            setIsLoading(false);
          }
        },
        (err) => {
          console.warn('Firestore barbers sync error:', err);
          setSyncError(`Personel senkronizasyon hatası: ${err?.message || 'Bağlantı hatası'}`);
          setIsLoading(false);
        }
      );
      unsubs.push(unsubBarbers);

      // 3. Customers
      const unsubCustomers = onSnapshot(
        customersCol,
        (snapshot) => {
          try {
            const cloudCustomers: Customer[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Customer;
              if (data && data.id) cloudCustomers.push(data);
            });
            setCustomers(cloudCustomers);
            setIsOnlineSyncing(true);
            setIsLoading(false);
          } catch (err: any) {
            console.error('Error parsing customers snapshot:', err);
            setSyncError(`Müşteriler işlenirken hata: ${err?.message || err}`);
            setIsLoading(false);
          }
        },
        (err) => {
          console.warn('Firestore customers sync error:', err);
          setSyncError(`Müşteri senkronizasyon hatası: ${err?.message || 'Bağlantı hatası'}`);
          setIsLoading(false);
        }
      );
      unsubs.push(unsubCustomers);

      // 4. Services
      const unsubServices = onSnapshot(
        servicesCol,
        (snapshot) => {
          try {
            const cloudServices: Service[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Service;
              if (data && data.id) cloudServices.push(data);
            });
            if (cloudServices.length > 0) {
              setServices(cloudServices);
            } else {
              INITIAL_SERVICES.forEach((s) => {
                setDoc(doc(db, 'tarik_dilek_services', s.id), cleanFirestoreData(s)).catch((e) =>
                  console.error('Seed service error:', e)
                );
              });
            }
            setIsOnlineSyncing(true);
            setIsLoading(false);
          } catch (err: any) {
            console.error('Error parsing services snapshot:', err);
            setSyncError(`Hizmetler işlenirken hata: ${err?.message || err}`);
            setIsLoading(false);
          }
        },
        (err) => {
          console.warn('Firestore services sync error:', err);
          setSyncError(`Hizmet senkronizasyon hatası: ${err?.message || 'Bağlantı hatası'}`);
          setIsLoading(false);
        }
      );
      unsubs.push(unsubServices);

      // 5. Settings
      const unsubSettings = onSnapshot(
        settingsDocRef,
        (docSnap) => {
          try {
            if (docSnap.exists()) {
              const data = docSnap.data() as BusinessSettings;
              setSettings((prev) => ({ ...prev, ...data }));
            }
            setIsOnlineSyncing(true);
            setIsLoading(false);
          } catch (err: any) {
            console.error('Error parsing settings snapshot:', err);
            setSyncError(`Ayarlar işlenirken hata: ${err?.message || err}`);
            setIsLoading(false);
          }
        },
        (err) => {
          console.log('Firestore settings sync error:', err);
          setSyncError(`Ayar senkronizasyon hatası: ${err?.message || 'Bağlantı hatası'}`);
          setIsLoading(false);
        }
      );
      unsubs.push(unsubSettings);

      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 3500);

      return () => {
        clearTimeout(timeoutId);
        unsubs.forEach((unsub) => unsub());
      };
    } catch (setupErr: any) {
      console.error('Failed to attach Firestore listeners:', setupErr);
      setSyncError(`Firestore dinleyici hatası: ${setupErr?.message || setupErr}`);
      setIsLoading(false);
      return () => {
        unsubs.forEach((unsub) => unsub());
      };
    }
  }, []);

  // Manual cloud refresh function across all entities
  const refreshAppointments = useCallback(async (): Promise<boolean> => {
    try {
      // 1. Appointments
      const aptsSnap = await getDocs(appointmentsCol);
      const cloudApts: Appointment[] = [];
      aptsSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as Appointment;
        if (data && data.id) cloudApts.push(data);
      });
      if (cloudApts.length > 0) {
        setAppointments(cloudApts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }

      // 2. Barbers
      const barbersSnap = await getDocs(barbersCol);
      const cloudBarbers: Barber[] = [];
      barbersSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as Barber;
        if (data && data.id) cloudBarbers.push(data);
      });
      if (cloudBarbers.length > 0) {
        setBarbers(cloudBarbers);
      }

      // 3. Customers
      const custSnap = await getDocs(customersCol);
      const cloudCust: Customer[] = [];
      custSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as Customer;
        if (data && data.id) cloudCust.push(data);
      });
      setCustomers(cloudCust);

      // 4. Services
      const servicesSnap = await getDocs(servicesCol);
      const cloudServices: Service[] = [];
      servicesSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data() as Service;
        if (data && data.id) cloudServices.push(data);
      });
      if (cloudServices.length > 0) {
        setServices(cloudServices);
      }

      // 5. Settings
      const settingsSnap = await getDoc(settingsDocRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data() as BusinessSettings;
        setSettings((prev) => ({ ...prev, ...data }));
      }

      return true;
    } catch (e) {
      console.warn('Manual cloud refresh failed:', e);
      return false;
    }
  }, []);

  // Calculate available slots
  const getAvailableSlots = useCallback(
    (barberId: string, date: string, durationMinutes: number): string[] => {
      const barber = barbers.find((b) => b.id === barberId);
      if (!barber || !barber.active) return [];

      const targetDate = parseISODateToLocal(date);
      const dayOfWeek = targetDate.getDay();
      if (barber.daysOff.includes(dayOfWeek)) {
        return [];
      }

      const { start, end, lunchStart, lunchEnd } = barber.workingHours;
      const startMin = timeToMinutes(start);
      const endMin = timeToMinutes(end);
      const lunchStartMin = timeToMinutes(lunchStart);
      const lunchEndMin = timeToMinutes(lunchEnd);

      const dayAppointments = appointments.filter(
        (a) => a.barberId === barberId && a.date === date && a.status !== 'cancelled'
      );

      const busyRanges: Array<{ start: number; end: number }> = [];
      busyRanges.push({ start: lunchStartMin, end: lunchEndMin });

      dayAppointments.forEach((apt) => {
        busyRanges.push({
          start: timeToMinutes(apt.startTime),
          end: timeToMinutes(apt.endTime),
        });
      });

      const slotInterval = settings.slotIntervalMinutes || 30;
      const availableSlots: string[] = [];

      for (let time = startMin; time + durationMinutes <= endMin; time += slotInterval) {
        const slotEnd = time + durationMinutes;
        const isConflict = busyRanges.some(
          (range) => time < range.end && slotEnd > range.start
        );

        if (!isConflict) {
          availableSlots.push(minutesToTime(time));
        }
      }

      return availableSlots;
    },
    [barbers, appointments, settings.slotIntervalMinutes]
  );

  // Book appointment
  const bookAppointment = useCallback(
    async (data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      barberId: string;
      serviceIds: string[];
      date: string;
      startTime: string;
      notes?: string;
      source?: 'online' | 'manual';
    }): Promise<Appointment> => {
      const selectedServices = services.filter((s) => data.serviceIds.includes(s.id));
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
      const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

      const startMin = timeToMinutes(data.startTime);
      const endMin = startMin + totalDuration;
      const endTime = minutesToTime(endMin);

      const initialStatus: AppointmentStatus = settings.autoConfirmOnline ? 'confirmed' : 'pending';

      const uniqueId = 'apt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);

      const newAppointment: Appointment = {
        id: uniqueId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        barberId: data.barberId,
        serviceIds: data.serviceIds,
        date: data.date,
        startTime: data.startTime,
        endTime,
        totalDuration,
        totalPrice,
        status: initialStatus,
        notes: data.notes,
        source: data.source || 'online',
        createdAt: new Date().toISOString(),
      };

      setAppointments((prev) => [newAppointment, ...prev.filter((a) => a.id !== uniqueId)]);

      // Save to Firebase Firestore central server (non-blocking in background)
      setDoc(doc(db, 'tarik_dilek_appointments', newAppointment.id), cleanFirestoreData(newAppointment)).catch((e) => {
        console.error('Firestore save background error:', e);
      });

      // Add or update customer
      const existingCustomer = customers.find(
        (c) => c.phone.replace(/\D/g, '') === data.customerPhone.replace(/\D/g, '')
      );

      if (existingCustomer) {
        const updatedCust: Customer = {
          ...existingCustomer,
          visitCount: existingCustomer.visitCount + 1,
          totalSpent: existingCustomer.totalSpent + totalPrice,
          lastVisitDate: data.date,
          notes: data.notes ? `${existingCustomer.notes || ''} | ${data.notes}` : existingCustomer.notes,
        };
        setCustomers((prev) => prev.map((c) => (c.id === existingCustomer.id ? updatedCust : c)));
        setDoc(doc(db, 'tarik_dilek_customers', updatedCust.id), cleanFirestoreData(updatedCust)).catch(console.error);
      } else {
        const newCust: Customer = {
          id: 'cust-' + Date.now().toString(36),
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
          notes: data.notes,
          createdAt: new Date().toISOString().split('T')[0],
          visitCount: 1,
          totalSpent: totalPrice,
          lastVisitDate: data.date,
        };
        setCustomers((prev) => [newCust, ...prev]);
        setDoc(doc(db, 'tarik_dilek_customers', newCust.id), cleanFirestoreData(newCust)).catch(console.error);
      }

      // In-app Notification
      const barber = barbers.find((b) => b.id === data.barberId);
      const uniqueNotifId = 'notif-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
      const newNotification: NotificationItem = {
        id: uniqueNotifId,
        title: `Yeni Randevu: ${data.customerName}`,
        body: `${barber?.name || 'Berber'} için ${data.date} saat ${data.startTime} randevusu oluşturuldu.`,
        timestamp: new Date().toISOString(),
        read: false,
        appointmentId: newAppointment.id,
        type: 'new_booking',
      };
      setNotifications((prev) => [newNotification, ...prev.filter((n) => n.id !== uniqueNotifId)]);

      // Trigger instant manager push notification & chime (non-blocking)
      sendInstantNotification(
        newNotification.title,
        newNotification.body,
        newAppointment.id
      ).catch((e) => {
        console.warn('Notification warning:', e);
      });

      return newAppointment;
    },
    [barbers, services, settings, customers]
  );

  // Update appointment status
  const updateAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    let updatedApt: Appointment | null = null;
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          updatedApt = { ...apt, status };
          return updatedApt;
        }
        return apt;
      })
    );

    if (updatedApt) {
      try {
        await setDoc(doc(db, 'tarik_dilek_appointments', id), cleanFirestoreData(updatedApt));
      } catch (e) {
        console.error('Firestore status update error:', e);
      }
    }
  }, []);

  // Update whole appointment (reschedule, change barber, etc.)
  const updateAppointment = useCallback(async (updated: Appointment) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === updated.id ? updated : apt))
    );
    try {
      await setDoc(doc(db, 'tarik_dilek_appointments', updated.id), cleanFirestoreData(updated));
    } catch (e) {
      console.error('Firestore update error:', e);
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'tarik_dilek_appointments', id));
    } catch (e) {
      console.error('Firestore delete error:', e);
    }
  }, []);

  // Barber management
  const addBarber = useCallback(async (barberData: Omit<Barber, 'id'>) => {
    const newBarber: Barber = {
      ...barberData,
      id: 'b-' + Date.now().toString(36),
      pin: barberData.pin || '1234',
    };
    setBarbers((prev) => [...prev, newBarber]);
    try {
      await setDoc(doc(db, 'tarik_dilek_barbers', newBarber.id), cleanFirestoreData(newBarber));
    } catch (e) {
      console.error('Firestore addBarber error:', e);
    }
  }, []);

  const updateBarber = useCallback(async (updated: Barber) => {
    setBarbers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await setDoc(doc(db, 'tarik_dilek_barbers', updated.id), cleanFirestoreData(updated));
    } catch (e) {
      console.error('Firestore updateBarber error:', e);
    }
  }, []);

  const deleteBarber = useCallback(async (id: string) => {
    setBarbers((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'tarik_dilek_barbers', id));
    } catch (e) {
      console.error('Firestore deleteBarber error:', e);
    }
  }, []);

  const toggleBarberActive = useCallback(async (id: string) => {
    setBarbers((prev) => {
      const updatedList = prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
      const target = updatedList.find((b) => b.id === id);
      if (target) {
        setDoc(doc(db, 'tarik_dilek_barbers', id), cleanFirestoreData(target)).catch(console.error);
      }
      return updatedList;
    });
  }, []);

  // Service Management
  const addService = useCallback(async (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: 's-' + Date.now().toString(36),
    };
    setServices((prev) => [...prev, newService]);
    try {
      await setDoc(doc(db, 'tarik_dilek_services', newService.id), cleanFirestoreData(newService));
    } catch (e) {
      console.error('Firestore addService error:', e);
    }
  }, []);

  const updateService = useCallback(async (updated: Service) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    try {
      await setDoc(doc(db, 'tarik_dilek_services', updated.id), cleanFirestoreData(updated));
    } catch (e) {
      console.error('Firestore updateService error:', e);
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'tarik_dilek_services', id));
    } catch (e) {
      console.error('Firestore deleteService error:', e);
    }
  }, []);

  // Customer management
  const addCustomer = useCallback(
    (customerData: Omit<Customer, 'id' | 'createdAt' | 'visitCount' | 'totalSpent'>): Customer => {
      const newCustomer: Customer = {
        ...customerData,
        id: 'c-' + Date.now().toString(36),
        createdAt: new Date().toISOString().split('T')[0],
        visitCount: 0,
        totalSpent: 0,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      setDoc(doc(db, 'tarik_dilek_customers', newCustomer.id), cleanFirestoreData(newCustomer)).catch(console.error);
      return newCustomer;
    },
    []
  );

  const updateCustomer = useCallback(async (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await setDoc(doc(db, 'tarik_dilek_customers', updated.id), cleanFirestoreData(updated));
    } catch (e) {
      console.error('Firestore updateCustomer error:', e);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'tarik_dilek_customers', id));
    } catch (e) {
      console.error('Firestore deleteCustomer error:', e);
    }
  }, []);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      setDoc(settingsDocRef, cleanFirestoreData(merged), { merge: true }).catch(console.error);
      return merged;
    });
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const triggerTestPushNotification = useCallback(async () => {
    await sendInstantNotification(
      '💈 Tarık Dilek Test Bildirimi',
      'Bildirim ve ses motoru kusursuz çalışıyor! Yeni randevularda telefonunuz çalacak.',
      'test'
    );
  }, []);

  const resetToDefaultData = useCallback(() => {
    localStorage.clear();
    setBarbers(INITIAL_BARBERS);
    setServices(INITIAL_SERVICES);
    setCustomers(INITIAL_CUSTOMERS);
    setAppointments(INITIAL_APPOINTMENTS);
    setSettings(INITIAL_SETTINGS);
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      barbers,
      services,
      customers,
      appointments,
      notifications,
      settings,
      activeMode,
      setActiveMode,
      currentUser,
      currentUserRole,
      loggedInBarberId,
      loginAsManager,
      loginAsStaff,
      logout,
      selectedDate,
      setSelectedDate,
      selectedBarberFilter,
      setSelectedBarberFilter,
      statusFilter,
      setStatusFilter,
      getAvailableSlots,
      bookAppointment,
      updateAppointmentStatus,
      updateAppointment,
      deleteAppointment,
      addBarber,
      updateBarber,
      deleteBarber,
      toggleBarberActive,
      addService,
      updateService,
      deleteService,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      updateSettings,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      triggerTestPushNotification,
      refreshAppointments,
      resetToDefaultData,
      isLoading,
      isOnlineSyncing,
      syncError,
      clearSyncError,
    }),
    [
      barbers,
      services,
      customers,
      appointments,
      notifications,
      settings,
      activeMode,
      currentUser,
      currentUserRole,
      loggedInBarberId,
      loginAsManager,
      loginAsStaff,
      logout,
      selectedDate,
      selectedBarberFilter,
      statusFilter,
      getAvailableSlots,
      bookAppointment,
      updateAppointmentStatus,
      updateAppointment,
      deleteAppointment,
      addBarber,
      updateBarber,
      deleteBarber,
      toggleBarberActive,
      addService,
      updateService,
      deleteService,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      updateSettings,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      triggerTestPushNotification,
      refreshAppointments,
      resetToDefaultData,
      isLoading,
      isOnlineSyncing,
      syncError,
      clearSyncError,
    ]
  );

  return <BarberContext.Provider value={value}>{children}</BarberContext.Provider>;
};

export const useBarber = () => {
  const context = useContext(BarberContext);
  if (!context) {
    throw new Error('useBarber must be used within a BarberProvider');
  }
  return context;
};

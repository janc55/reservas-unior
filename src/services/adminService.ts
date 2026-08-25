import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EquipmentItem, Reservation, ReservationStatus } from '../types';
import { isTimeRangeOverlapping } from '../utils/reservationValidation';

export interface AdminMetrics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

function mapReservationDoc(id: string, data: DocumentData): Reservation {
  return {
    id,
    userId: String(data.userId ?? ''),
    userName: String(data.userName ?? ''),
    userEmail: String(data.userEmail ?? ''),
    eventName: String(data.eventName ?? ''),
    eventType: data.eventType as Reservation['eventType'],
    date: String(data.date ?? ''),
    startTime: String(data.startTime ?? ''),
    endTime: String(data.endTime ?? ''),
    equipment: (data.equipment as Reservation['equipment']) ?? [],
    attendees: Number(data.attendees ?? 0),
    additionalNotes: String(data.additionalNotes ?? ''),
    status: data.status as ReservationStatus,
    adminNotes: data.adminNotes ? String(data.adminNotes) : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    approvedAt: data.approvedAt ?? null,
    rejectedAt: data.rejectedAt ?? null,
    notificationSent: (data.notificationSent as Reservation['notificationSent']) ?? {
      confirmation: false,
      reminder: false,
      dailyReport: false,
    },
  };
}

function mapEquipmentDoc(id: string, data: DocumentData): EquipmentItem {
  return {
    id,
    name: String(data.name ?? ''),
    icon: String(data.icon ?? 'Package'),
    available: Boolean(data.available),
    quantity: Number(data.quantity ?? 0),
    description: String(data.description ?? ''),
  };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const reservationsRef = collection(db, 'reservations');

  const pendingSnap = await getDocs(
    query(reservationsRef, where('status', '==', 'pending'))
  );
  const approvedSnap = await getDocs(
    query(reservationsRef, where('status', '==', 'approved'))
  );
  const rejectedSnap = await getDocs(
    query(reservationsRef, where('status', '==', 'rejected'))
  );

  return {
    pending: pendingSnap.size,
    approved: approvedSnap.size,
    rejected: rejectedSnap.size,
    total: pendingSnap.size + approvedSnap.size + rejectedSnap.size,
  };
}

export async function getPendingReservations(): Promise<Reservation[]> {
  const reservationsRef = collection(db, 'reservations');
  const q = query(
    reservationsRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => mapReservationDoc(doc.id, doc.data()));
}

export async function getAllReservations(filters?: {
  status?: ReservationStatus;
  date?: string;
  eventType?: string;
}): Promise<Reservation[]> {
  const reservationsRef = collection(db, 'reservations');
  let q;

  if (filters?.status) {
    q = query(
      reservationsRef,
      where('status', '==', filters.status),
      orderBy('date', 'desc')
    );
  } else {
    q = query(reservationsRef, orderBy('date', 'desc'));
  }

  const snapshot = await getDocs(q);
  let reservations = snapshot.docs.map((doc) =>
    mapReservationDoc(doc.id, doc.data())
  );

  if (filters?.date) {
    reservations = reservations.filter((r) => r.date === filters.date);
  }

  if (filters?.eventType) {
    reservations = reservations.filter((r) => r.eventType === filters.eventType);
  }

  return reservations;
}

export async function checkTimeConflict(
  reservationId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<Reservation | null> {
  const reservationsRef = collection(db, 'reservations');
  const q = query(
    reservationsRef,
    where('date', '==', date),
    where('status', '==', 'approved')
  );
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    if (docSnap.id === reservationId) continue;
    const data = docSnap.data();
    if (isTimeRangeOverlapping(startTime, endTime, data.startTime, data.endTime)) {
      return mapReservationDoc(docSnap.id, data);
    }
  }

  return null;
}

export async function approveReservation(
  reservationId: string,
  adminNotes: string = ''
): Promise<void> {
  const reservationRef = doc(db, 'reservations', reservationId);
  const snapshot = await getDoc(reservationRef);

  if (!snapshot.exists()) {
    throw new Error('La reserva no existe.');
  }

  const reservation = snapshot.data();
  if (reservation.status !== 'pending') {
    throw new Error('Solo se pueden aprobar reservas pendientes.');
  }

  const conflict = await checkTimeConflict(
    reservationId,
    reservation.date,
    reservation.startTime,
    reservation.endTime
  );

  if (conflict) {
    throw new Error(
      `Conflicto de horario: se solapa con "${conflict.eventName}" (${conflict.startTime} - ${conflict.endTime}).`
    );
  }

  await updateDoc(reservationRef, {
    status: 'approved',
    adminNotes: adminNotes.trim(),
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectReservation(
  reservationId: string,
  adminNotes: string = ''
): Promise<void> {
  const reservationRef = doc(db, 'reservations', reservationId);
  const snapshot = await getDoc(reservationRef);

  if (!snapshot.exists()) {
    throw new Error('La reserva no existe.');
  }

  const reservation = snapshot.data();
  if (reservation.status !== 'pending') {
    throw new Error('Solo se pueden rechazar reservas pendientes.');
  }

  await updateDoc(reservationRef, {
    status: 'rejected',
    adminNotes: adminNotes.trim(),
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getEquipmentCatalog(): Promise<EquipmentItem[]> {
  const equipmentRef = collection(db, 'equipment');
  const snapshot = await getDocs(equipmentRef);
  return snapshot.docs.map((doc) => mapEquipmentDoc(doc.id, doc.data()));
}

export async function createEquipment(
  data: Omit<EquipmentItem, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'equipment'), {
    name: data.name.trim(),
    icon: data.icon,
    available: data.available,
    quantity: data.quantity,
    description: data.description.trim(),
  });
  return docRef.id;
}

export async function updateEquipment(
  id: string,
  data: Partial<Omit<EquipmentItem, 'id'>>
): Promise<void> {
  const equipmentRef = doc(db, 'equipment', id);
  const snapshot = await getDoc(equipmentRef);

  if (!snapshot.exists()) {
    throw new Error('El equipamiento no existe.');
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();

  await updateDoc(equipmentRef, updateData);
}

export async function deleteEquipment(id: string): Promise<void> {
  const equipmentRef = doc(db, 'equipment', id);
  const snapshot = await getDoc(equipmentRef);

  if (!snapshot.exists()) {
    throw new Error('El equipamiento no existe.');
  }

  const reservationsRef = collection(db, 'reservations');
  const q = query(
    reservationsRef,
    where('status', 'in', ['pending', 'approved'])
  );
  const snapshot2 = await getDocs(q);

  const hasDependency = snapshot2.docs.some((doc) => {
    const equipment = doc.data().equipment as Array<{ id: string }>;
    return equipment?.some((eq) => eq.id === id);
  });

  if (hasDependency) {
    throw new Error(
      'No se puede eliminar: el equipamiento está en uso en reservas activas.'
    );
  }

  await deleteDoc(equipmentRef);
}

export async function setInitialAdmin(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error('El usuario no existe.');
  }

  const currentRole = snapshot.data().role;
  if (currentRole === 'admin') {
    throw new Error('El usuario ya es administrador.');
  }

  await updateDoc(userRef, {
    role: 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function becomeFirstAdmin(uid: string): Promise<void> {
  const usersRef = collection(db, 'users');
  const adminQuery = query(usersRef, where('role', '==', 'admin'));
  const adminSnapshot = await getDocs(adminQuery);

  if (adminSnapshot.size > 0) {
    throw new Error(
      'Ya existe un administrador en el sistema. Solicita acceso al administrador actual.'
    );
  }

  const userRef = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error('El usuario no existe.');
  }

  await updateDoc(userRef, {
    role: 'admin',
    updatedAt: serverTimestamp(),
  });
}

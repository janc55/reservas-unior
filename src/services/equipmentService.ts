import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EquipmentItem } from '../types';

function mapEquipmentDoc(id: string, data: Record<string, unknown>): EquipmentItem {
  return {
    id,
    name: String(data.name ?? ''),
    icon: String(data.icon ?? 'Package'),
    available: Boolean(data.available),
    quantity: Number(data.quantity ?? 0),
    description: String(data.description ?? ''),
  };
}

export async function getAvailableEquipment(): Promise<EquipmentItem[]> {
  const equipmentRef = collection(db, 'equipment');
  const q = query(equipmentRef, where('available', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => mapEquipmentDoc(doc.id, doc.data()))
    .filter((item) => item.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function getPublicEquipmentCatalog(): Promise<EquipmentItem[]> {
  return getAvailableEquipment();
}

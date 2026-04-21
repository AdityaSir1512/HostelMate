import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function isAdminEmailAllowed(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const adminQuery = query(
    collection(db, 'adminProfiles'),
    where('email', '==', normalizedEmail)
  );
  const snapshot = await getDocs(adminQuery);
  return !snapshot.empty;
}

export async function getAdminProfileByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const adminQuery = query(
    collection(db, 'adminProfiles'),
    where('email', '==', normalizedEmail)
  );
  const snapshot = await getDocs(adminQuery);
  if (snapshot.empty) {
    return null;
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

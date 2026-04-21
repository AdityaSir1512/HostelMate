import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

function normalizeEnrollment(enrollmentNo) {
  return String(enrollmentNo || '').trim().toUpperCase();
}

function normalizeStudentProfile(data, fallbackEnrollment = '') {
  return {
    id: data.id || data.uid || normalizeEnrollment(fallbackEnrollment),
    enrollmentNo: normalizeEnrollment(data.enrollmentNo || fallbackEnrollment),
    hostelBuilding: data.hostelBuilding || 'N/A',
    roomNo: data.roomNo || 'N/A',
    department: data.department || '',
    gender: data.gender || '',
    fatherName: data.fatherName || '',
    fatherPhone: data.fatherPhone || '',
    motherName: data.motherName || '',
    motherPhone: data.motherPhone || '',
    profilePic: data.profilePic || '',
    role: data.role || 'student',
    displayName: data.displayName || '',
    email: data.email || '',
    uid: data.uid || '',
  };
}

export async function listStudentProfiles() {
  const snapshot = await getDocs(collection(db, 'userProfiles'));
  return snapshot.docs
    .map((profileDoc) => ({ id: profileDoc.id, ...profileDoc.data() }))
    .filter((profile) => profile.role === 'student' || !profile.role)
    .map((profile) => normalizeStudentProfile(profile, profile.enrollmentNo));
}

export async function saveStudentRecord(uid, payload) {
  const normalizedEnrollment = normalizeEnrollment(payload.enrollmentNo);
  const nextProfile = {
    ...payload,
    enrollmentNo: normalizedEnrollment,
    role: payload.role || 'student',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'userProfiles', uid), nextProfile, { merge: true });

  if (normalizedEnrollment) {
    await setDoc(
      doc(db, 'studentProfiles', normalizedEnrollment),
      {
        ...nextProfile,
        uid,
      },
      { merge: true }
    );
  }

  return nextProfile;
}

export async function getUserProfile(uid) {
  const profileDoc = await getDoc(doc(db, 'userProfiles', uid));
  return profileDoc.exists() ? profileDoc.data() : null;
}

export async function saveUserProfile(uid, payload) {
  await setDoc(
    doc(db, 'userProfiles', uid),
    {
      ...payload,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

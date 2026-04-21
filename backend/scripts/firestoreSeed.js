require('dotenv').config();
const { db } = require('../config/firebaseAdmin');

const adminProfiles = [
  {
    id: 'hostel-admin',
    email: 'admin@hostelmate.com',
    role: 'admin',
    displayName: 'Hostel Admin',
    profilePic: '',
    updatedAt: new Date().toISOString(),
  },
];

const studentProfiles = [
  {
    id: '23CS001',
    enrollmentNo: '23CS001',
    displayName: 'Aman Kumar',
    email: 'aman@example.com',
    hostelBuilding: 'A Block',
    roomNo: '204',
    department: 'Computer Science',
    gender: 'male',
    fatherName: 'Rakesh Kumar',
    fatherPhone: '9876543210',
    motherName: 'Sita Devi',
    motherPhone: '9876543220',
    profilePic: '',
    role: 'student',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '23EC014',
    enrollmentNo: '23EC014',
    displayName: 'Priya Sharma',
    email: 'priya@example.com',
    hostelBuilding: 'B Block',
    roomNo: '118',
    department: 'Electronics',
    gender: 'female',
    fatherName: 'Vijay Sharma',
    fatherPhone: '9876500001',
    motherName: 'Meena Sharma',
    motherPhone: '9876500002',
    profilePic: '',
    role: 'student',
    updatedAt: new Date().toISOString(),
  },
];

async function seedCollection(collectionName, records) {
  const batch = db.batch();

  records.forEach((record) => {
    const ref = db.collection(collectionName).doc(record.id);
    const payload = { ...record };
    delete payload.id;
    batch.set(ref, payload, { merge: true });
  });

  await batch.commit();
}

async function main() {
  try {
    await seedCollection('adminProfiles', adminProfiles);
    await seedCollection('studentProfiles', studentProfiles);
    console.log('Firestore seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Firestore seed failed:', error);
    process.exit(1);
  }
}

main();

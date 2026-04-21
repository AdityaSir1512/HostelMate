require('dotenv').config();

const { admin, db } = require('../config/firebaseAdmin');

async function main() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '').trim();
  const displayName = String(process.env.ADMIN_NAME || 'Hostel Admin').trim();

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the backend environment before running this script.');
  }

  const existingUser = await admin.auth().getUserByEmail(email).catch(() => null);
  const authUser = existingUser
    ? await admin.auth().updateUser(existingUser.uid, {
        password,
        displayName,
      })
    : await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });

  await db.collection('adminProfiles').doc(authUser.uid).set(
    {
      id: authUser.uid,
      email,
      role: 'admin',
      displayName,
      profilePic: '',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`Admin account ready for ${email}`);
}

main().catch((error) => {
  console.error('Failed to create admin account:', error);
  process.exit(1);
});
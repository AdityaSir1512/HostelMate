const { db, admin } = require('../config/firebaseAdmin');

const fallbackCollections = new Map();

function getFallbackCollection(collectionName) {
  if (!fallbackCollections.has(collectionName)) {
    fallbackCollections.set(collectionName, new Map());
  }

  return fallbackCollections.get(collectionName);
}

function createFallbackId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function logFallback(collectionName, error) {
  console.warn(
    `[${collectionName}] Firestore unavailable, using in-memory fallback: ${error.message}`
  );
  console.error(`[${collectionName}] Full error:`, error);
}

function createCrudModel(collectionName) {
  const collection = db.collection(collectionName);
  const fallbackCollection = getFallbackCollection(collectionName);

  return {
    async list() {
      try {
        const snapshot = await collection.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        logFallback(collectionName, error);
        return Array.from(fallbackCollection.values()).sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
      }
    },

    async getById(id) {
      try {
        const doc = await collection.doc(id).get();
        if (!doc.exists) {
          return null;
        }
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        logFallback(collectionName, error);
        return fallbackCollection.get(id) || null;
      }
    },

    async create(data) {
      const payload = {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      try {
        const docRef = await collection.add(payload);
        const createdDoc = await docRef.get();
        return { id: createdDoc.id, ...createdDoc.data() };
      } catch (error) {
        logFallback(collectionName, error);
        const id = createFallbackId();
        const now = new Date().toISOString();
        const created = {
          id,
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        fallbackCollection.set(id, created);
        return created;
      }
    },

    async update(id, data) {
      try {
        const docRef = collection.doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
          return null;
        }

        await docRef.update({
          ...data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
      } catch (error) {
        logFallback(collectionName, error);
        const existing = fallbackCollection.get(id);
        if (!existing) {
          return null;
        }

        const updated = {
          ...existing,
          ...data,
          id,
          updatedAt: new Date().toISOString(),
        };
        fallbackCollection.set(id, updated);
        return updated;
      }
    },

    async remove(id) {
      try {
        const docRef = collection.doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
          return false;
        }

        await docRef.delete();
        return true;
      } catch (error) {
        logFallback(collectionName, error);
        return fallbackCollection.delete(id);
      }
    },
  };
}

module.exports = createCrudModel;

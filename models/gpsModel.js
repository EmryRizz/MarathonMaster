const admin = require('firebase-admin');
const db = admin.firestore();

const GPSModel = {
    collection: db.collection('gps_data'),

    // Add GPS data
    addGPSData: async (data) => {
        const res = await GPSModel.collection.add(data);
        return res.id; // Return the document ID
    },

    // Get GPS data by ID
    getGPSData: async (id) => {
        const doc = await GPSModel.collection.doc(id).get();
        if (!doc.exists) {
            throw new Error('Data not found');
        }
        return doc.data();
    },

    // Get all GPS data
    getAllGPSData: async () => {
        const snapshot = await GPSModel.collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
};

module.exports = GPSModel;

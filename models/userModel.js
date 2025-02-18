const admin = require('firebase-admin');
const db = require('../config/firebase');


const UsersModel = {
    collection: db.collection('user'),

    // Add a new user
    addUser: async (data) => {
        const res = await UsersModel.collection.add(data);
        return res.id; // Return the document ID
    },

    // Get a user by ID
    getUser: async (id) => {
        const doc = await UsersModel.collection.doc(id).get();
        if (!doc.exists) {
            throw new Error('User not found');
        }
        return doc.data();
    },

    // Update a user
    updateUser: async (id, data) => {
        await UsersModel.collection.doc(id).update(data);
    },

    // Delete a user
    deleteUser: async (id) => {
        await UsersModel.collection.doc(id).delete();
    },

    // Get all users
    getAllUsers: async () => {
        const snapshot = await UsersModel.collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
};

module.exports = UsersModel;

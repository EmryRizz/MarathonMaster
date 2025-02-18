const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../config/firebase-config');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp; 
module.exports = {db, Timestamp};
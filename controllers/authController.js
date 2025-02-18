const path = require('path');
const admin = require('firebase-admin');
const { db, Timestamp } = require('../config/firebase');



// Show the login form
const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

// Process the login request
const processLogin = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).render('login', {
            title: 'Login',
            error: 'Both username and password are required.'
        });
    }

    try {
        // Query Firestore for the user
        const usersCollection = db.collection('user'); // Replace 'users' with your collection name
        const querySnapshot = await usersCollection
            .where('username', '==', username)
            .where('password', '==', password)
            .get();

        // Check if user exists
        if (querySnapshot.empty) {
            return res.status(401).render('login', {
                title: 'Login',
                error: 'Invalid username or password.'
            });
        }

        // Successful login
        const userDoc = querySnapshot.docs[0]; // Assuming usernames are unique
        const userData = userDoc.data();

        // Store user information in session
        req.session.user = {
            id: userDoc.id,
            username: userData.username
        };

        return res.redirect('/dashboard'); // Redirect to dashboard
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).render('login', {
            title: 'Login',
            error: 'An error occurred. Please try again later.'
        });
    }
};

// Show the register form
const showRegisterForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

// Export all functions in a single object
module.exports = {
    showLoginForm,
    processLogin,
    showRegisterForm
};

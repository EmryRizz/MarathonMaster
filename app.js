const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();


app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

app.use(session({
    secret: 'your-secret-key',  // Secret key for session management
    resave: false,
    saveUninitialized: true
}));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Dashboard-related routes (e.g., start stopwatch)
const historyRoutes = require('./routes/historyRoutes'); // History-related routes (e.g., viewing history)
const profileRoutes = require('./routes/profileRoutes'); 


// Use the routes
app.use('/', authRoutes);  // Auth-related routes (login, register)
app.use('/', dashboardRoutes); // Dashboard routes (start stopwatch, save time)
app.use('/', historyRoutes); // History routes (view history)
app.use('/', profileRoutes);

app.get('/', (req, res) => {
    res.render('login'); // Show the login view for the root URL
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

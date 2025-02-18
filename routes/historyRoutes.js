const express = require('express');
const router = express.Router();
const { saveStopwatchTime } = require('../controllers/dashboardController');
const { Timestamp } = require('../config/firebase');  // Import Timestamp


// Define the route with an async function
router.get('/history', async (req, res) => {
    try {
        // Call the async function and await the result
        const speeds = req.session.speeds || [];  // Retrieve speeds from session or default to an empty array
        const startTime = req.session.startTime || "N/A";  // Retrieve formatted start time or a fallback
        const endTime = req.session.endTime || "N/A";
        const averageSpeed = req.session.averageSpeed || 0;
        const timestamps = req.session.timestamps || [];
        const tSpeed = req.session.tSpeed || 0;

        function formatTime(milliseconds) {
            const date = new Date(milliseconds);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        console.log('routes Timestamps:', timestamps);

        const speedsString = speeds.join(',');
        const timestampsString = timestamps
        .map(timestamp => {
            if (timestamp && typeof timestamp._seconds === 'number' && typeof timestamp._nanoseconds === 'number') {
                const milliseconds = timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;
                
                console.log(`Raw timestamp: ${JSON.stringify(timestamp)}`);
                console.log(`Calculated milliseconds: ${milliseconds}`);
    
                return formatTime(milliseconds);
            } else {
                console.error('Invalid Firestore timestamp:', timestamp);
                return ''; // Handle invalid timestamp
            }
        })
        .join(',');
    
    
    

        console.log('routes:', { speeds, startTime, endTime, averageSpeed, speedsString, timestampsString, tSpeed });

        // Render the view with the speeds and formatted times
        res.render('history', { speeds, startTime, endTime, averageSpeed, speedsString, timestampsString, tSpeed });
    } catch (error) {
        console.error('Error fetching speeds:', error);
        res.render('history', { speeds: [] });  // In case of error, pass an empty array
    }
});

module.exports = router;

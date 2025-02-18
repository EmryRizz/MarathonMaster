const express = require('express');
const router = express.Router();
const { db, Timestamp } = require('../config/firebase');


const saveStopwatchTime = async (req, res) => {
    const { time, speed, action, startTime, endTime } = req.body;  // Extract action, time, speed, and timestamp parameters

    if (action === 'saveStopwatchTime') {
        // Save time and speed logic
        try {
            // Update Firestore with the new speed value
            const setSpeedRef = db.collection('set_speed').doc('speed_threshold');
            await setSpeedRef.update({
                speed: parseInt(speed), // Ensure speed is saved as a number
            });

            console.log(`Speed saved in Firestore: ${speed}`);
            return res.json({ message: 'Time and speed saved successfully!' });

        } catch (error) {
            console.error('Error saving speed to Firestore:', error);
            return res.status(500).json({ message: 'Error saving time and speed.' });
        }

    } else if (action === 'getSpeedsFromFirestore') {
        // Get speed data from Firestore logic
        try {
            console.log("WRKING");
            console.log("start Time :", startTime);
            console.log("end Time:", endTime);
            
            const startTimestamp = Timestamp.fromMillis(startTime);  // Convert milliseconds directly to Firestore Timestamp
            const endTimestamp = Timestamp.fromMillis(endTime);      // Convert milliseconds directly to Firestore Timestamp
            
            console.log('Start Timestamp:', startTimestamp);
            console.log('End Timestamp:', endTimestamp);

            // Fetch the speeds from Firestore between the start and end timestamps
            const snapshot = await db.collection('gps_data')
                .where('timestamp', '>=', startTimestamp)
                .where('timestamp', '<=', endTimestamp)
                .get();
            

                const speeds = [];
                const timestamps = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    
                    // Push speed to speeds array
                    speeds.push(data.speed);
                    
                    // Push timestamp to timestamps array
                    timestamps.push(data.timestamp);
                });
                
                console.log(speeds);     
                console.log(timestamps);  
                

            function formatTime(milliseconds) {
                const date = new Date(milliseconds);
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            }
            const formattedStartTime = formatTime(Number(startTime));
            const formattedEndTime = formatTime(Number(endTime));

 
            const calculateAverageSpeed = (speeds) => {
                if (speeds.length === 0) return 0; // Handle empty array
            
                // Ensure that speeds are numbers
                const sum = speeds.reduce((total, speed) => total + speed, 0); // Directly add speed values
                console.log('sum:',sum);
               
                return (sum / speeds.length).toFixed(2); // Calculate average speed
            };
            

            const averageSpeed = calculateAverageSpeed(speeds); // Calculate average speed

            console.log('controller:', speeds, averageSpeed);

            const docRef = db.collection('set_speed').doc('speed_threshold'); // Replace with your actual document ID
            const doc = await docRef.get();
        
            // Directly get the speed value (assuming the document exists and the field is present)
            const speed = doc.data().speed;
            console.log("Speed from Firestore:", speed);
        
            // Use the speed value as needed
            const tSpeed = speed;
            console.log("Threshold Speed:", tSpeed);

            req.session.speeds = speeds;
            req.session.averageSpeed = averageSpeed;
            req.session.startTime = formattedStartTime;
            req.session.endTime = formattedEndTime;
            req.session.timestamps = timestamps;
            req.session.tSpeed = tSpeed;

            if (res) {
                return res.json({ speeds: speeds }); // Return dummy data as JSON for HTTP calls
            }
            return speeds; // Direct invocation returns the data
        

        } catch (error) {
            console.error('Error retrieving speeds from Firestore:', error);
          
        }

    } else {
        // Handle invalid action case
     
    }
};


module.exports = {
    saveStopwatchTime,

};

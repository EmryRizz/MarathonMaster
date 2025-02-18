const express = require('express');
const router = express.Router();
const { saveStopwatchTime } = require('../controllers/dashboardController');

router.post('/dashboard2', saveStopwatchTime);


router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

module.exports = router;

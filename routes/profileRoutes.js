const express = require('express');
const router = express.Router();

// Profile route (GET)
router.get('/profile', (req, res) => {
    res.render('profile');  // Render profile view
});

module.exports = router;

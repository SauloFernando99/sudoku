const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secret = 'your_secret_key';

const authenticateToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.sendStatus(403);
    
    jwt.verify(token, secret, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = await User.findByPk(decoded.id);
        next();
    });
};

router.get('/sudoku', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to the Sudoku game, ${req.user.username}!` });
});

module.exports = router;

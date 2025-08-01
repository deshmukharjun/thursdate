const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper function to handle different pool methods
const executeQuery = async (query, params) => {
    // Check if the pool has a .query method (for PostgreSQL)
    if (pool.query) {
        // Use .query() for PostgreSQL
        const result = await pool.query(query, params);
        return [result.rows];
    } else {
        // Use .execute() for MySQL
        return pool.execute(query, params);
    }
};

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Registration attempt for:', email);
        
        // Check if user already exists
        const [existingUsers] = await executeQuery(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const [result] = await executeQuery(
            'INSERT INTO users (email, password) VALUES ($1, $2)',
            [email, hashedPassword]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            userId: result.insertId
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const [users] = await executeQuery(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            userId: user.id
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete account endpoint
router.delete('/account', auth, async (req, res) => {
    try {
        // Delete user from database
        await executeQuery(
            'DELETE FROM users WHERE id = $1',
            [req.user.userId]
        );
        
        res.json({ message: 'Account deleted successfully' });
        
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
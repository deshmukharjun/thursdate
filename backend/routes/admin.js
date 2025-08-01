const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper function to handle different pool methods and placeholders
const executeQuery = async (query, params) => {
    if (pool.query) { // For PostgreSQL
        const result = await pool.query(query, params);
        // console.log("PostgreSQL query result:", result.rows);
        return [result.rows, result.fields];
    } else { // For MySQL
        // console.log("MySQL query result:", await pool.execute(query, params));
        return pool.execute(query, params);
    }
};

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, defaultValue = null) => {
    if (!jsonString) return defaultValue;
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parse error:', error);
        return defaultValue;
    }
};

// Helper function to validate database connection
const validateConnection = async () => {
    try {
        await executeQuery('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database connection validation failed:', error);
        return false;
    }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        console.log('🔐 Admin auth check for user ID:', req.user?.userId);
        
        if (!req.user || !req.user.userId) {
            console.log('❌ No user or userId found');
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Use executeQuery and PostgreSQL placeholder
        const [users] = await executeQuery(
            'SELECT email FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (users.length === 0) {
            console.log('❌ User not found in database');
            return res.status(404).json({ error: 'User not found' });
        }

        const userEmail = users[0].email;
        console.log('👤 User email:', userEmail);

        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@luyona.com'];
        console.log('🔑 Admin emails configured:', adminEmails);
        
        if (!adminEmails.includes(userEmail)) {
            console.log('❌ User email not in admin list');
            return res.status(403).json({ error: 'Admin access required' });
        }

        console.log('✅ Admin access granted');
        next();
    } catch (error) {
        console.error('❌ Admin auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin login endpoint (newly added)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Admin login attempt for:', email);

        // Check if email is in the admin list
        const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());
        if (!adminEmails.includes(email)) {
            console.log('❌ Admin login failed: Email not in admin list');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Find user in database
        const [users] = await executeQuery(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ Admin login failed: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Admin login failed: Invalid password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token with isAdmin flag
        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Admin login successful');
        res.json({
            message: 'Admin login successful',
            token,
            userId: user.id,
            isAdmin: true,
        });

    } catch (error) {
        console.error('❌ Admin login error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        if (!(await validateConnection())) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const [users] = await executeQuery(
            `SELECT id, email, first_name, last_name, gender, dob, profile_pic_url, intent, onboarding_complete, approval, created_at, updated_at
             FROM users ORDER BY created_at DESC`
        );

        const transformedUsers = users.map(user => ({
            ...user,
            intent: safeJsonParse(user.intent, {}),
            age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
            hasProfilePic: !!user.profile_pic_url,
            hasLifestyleImages: safeJsonParse(user.intent, {})?.lifestyleImageUrls?.filter(Boolean)?.length > 0,
            lifestyleImageCount: safeJsonParse(user.intent, {})?.lifestyleImageUrls?.filter(Boolean)?.length || 0
        }));

        res.json({
            users: transformedUsers,
            total: transformedUsers.length,
            approved: transformedUsers.filter(u => u.approval).length,
            pending: transformedUsers.filter(u => !u.approval).length,
            completedOnboarding: transformedUsers.filter(u => u.onboarding_complete).length
        });

    } catch (error) {
        console.error('❌ Get all users error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get waitlisted users (admin only)
router.get('/waitlist', auth, adminAuth, async (req, res) => {
    try {
        if (!(await validateConnection())) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const [users] = await executeQuery(
            `SELECT id, email, first_name, last_name, gender, dob, profile_pic_url, intent, onboarding_complete, approval, created_at, updated_at
             FROM users WHERE approval = false ORDER BY created_at ASC`
        );

        const transformedUsers = users.map(user => ({
            ...user,
            intent: safeJsonParse(user.intent, {}),
            age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
            hasProfilePic: !!user.profile_pic_url,
            hasLifestyleImages: safeJsonParse(user.intent, {})?.lifestyleImageUrls?.filter(Boolean)?.length > 0,
            lifestyleImageCount: safeJsonParse(user.intent, {})?.lifestyleImageUrls?.filter(Boolean)?.length || 0
        }));

        res.json({
            users: transformedUsers,
            total: transformedUsers.length,
        });

    } catch (error) {
        console.error('❌ Get waitlist error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Approve/Reject user
router.put('/users/:userId/approval', auth, adminAuth, async (req, res) => {
    try {
        if (!(await validateConnection())) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const { userId } = req.params;
        const { approval, reason } = req.body;

        const [existingUsers] = await executeQuery(
            'SELECT id, email FROM users WHERE id = $1',
            [userId]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [result] = await executeQuery(
            'UPDATE users SET approval = $1 WHERE id = $2 RETURNING *',
            [approval, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`User ${userId} (${existingUsers[0].email}) ${approval ? 'approved' : 'rejected'}`);

        res.json({
            message: `User ${approval ? 'approved' : 'rejected'} successfully`,
            userId: userId,
            approval: approval,
        });

    } catch (error) {
        console.error('❌ Update approval error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get user details (admin only)
router.get('/users/:userId', auth, adminAuth, async (req, res) => {
    try {
        if (!(await validateConnection())) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const { userId } = req.params;

        const [users] = await executeQuery(
            `SELECT id, email, first_name, last_name, gender, dob, current_location, 
             favourite_travel_destination, last_holiday_places, favourite_places_to_go, 
             profile_pic_url, intent, onboarding_complete, approval, created_at, updated_at
             FROM users WHERE id = $1`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        const transformedUser = {
            ...user,
            lastHolidayPlaces: safeJsonParse(user.last_holiday_places, []),
            favouritePlacesToGo: safeJsonParse(user.favourite_places_to_go, []),
            intent: safeJsonParse(user.intent, {}),
            age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null
        };

        res.json(transformedUser);

    } catch (error) {
        console.error('❌ Get user details error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get admin dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
    try {
        if (!(await validateConnection())) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const [totalResult] = await executeQuery('SELECT COUNT(*) as total FROM users');
        const totalUsers = totalResult[0].total;

        const [approvedResult] = await executeQuery('SELECT COUNT(*) as approved FROM users WHERE approval = true');
        const approvedUsers = approvedResult[0].approved;

        const [pendingResult] = await executeQuery('SELECT COUNT(*) as pending FROM users WHERE approval = false');
        const pendingUsers = pendingResult[0].pending;

        const [onboardingResult] = await executeQuery('SELECT COUNT(*) as completed FROM users WHERE onboarding_complete = true');
        const completedOnboarding = onboardingResult[0].completed;

        const [profilePicResult] = await executeQuery('SELECT COUNT(*) as withPic FROM users WHERE profile_pic_url IS NOT NULL');
        const usersWithProfilePic = profilePicResult[0].withPic;

        const [recentResult] = await executeQuery(
            `SELECT COUNT(*) as recent FROM users 
             WHERE created_at >= NOW() - INTERVAL '7 days'`
        );
        const recentRegistrations = recentResult[0].recent;

        const stats = {
            totalUsers,
            approvedUsers,
            pendingUsers,
            completedOnboarding,
            usersWithProfilePic,
            recentRegistrations,
            approvalRate: totalUsers > 0 ? ((approvedUsers / totalUsers) * 100).toFixed(1) : 0
        };

        res.json(stats);

    } catch (error) {
        console.error('❌ Get dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

module.exports = router;
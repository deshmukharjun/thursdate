const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

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
    await pool.execute('SELECT 1');
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
    
    // First check if user is authenticated
    if (!req.user || !req.user.userId) {
      console.log('❌ No user or userId found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin (you can modify this logic based on your admin criteria)
    const [users] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = users[0].email;
    console.log('👤 User email:', userEmail);

    // For now, let's consider users with specific emails as admin
    // You can modify this to add an 'is_admin' column to your database
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

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const [users] = await pool.execute(`
      SELECT 
        id, email, first_name, last_name, gender, dob, 
        current_location, profile_pic_url, intent, 
        onboarding_complete, approval, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    // Transform and parse JSON fields
    const transformedUsers = users.map(user => {
      const intent = safeJsonParse(user.intent, {});
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        gender: user.gender,
        dob: user.dob,
        currentLocation: user.current_location,
        profilePicUrl: user.profile_pic_url,
        intent: intent,
        onboardingComplete: user.onboarding_complete,
        approval: user.approval,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        // Calculate age if dob is available
        age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        // Check if user has profile picture
        hasProfilePic: !!user.profile_pic_url,
        // Check if user has lifestyle images
        hasLifestyleImages: intent && intent.lifestyleImageUrls && intent.lifestyleImageUrls.filter(Boolean).length > 0,
        lifestyleImageCount: intent && intent.lifestyleImageUrls ? intent.lifestyleImageUrls.filter(Boolean).length : 0
      };
    });

    res.json({
      users: transformedUsers,
      total: transformedUsers.length,
      approved: transformedUsers.filter(u => u.approval).length,
      pending: transformedUsers.filter(u => !u.approval).length,
      completedOnboarding: transformedUsers.filter(u => u.onboardingComplete).length
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Get waitlisted users (users who haven't been approved yet)
router.get('/waitlist', auth, adminAuth, async (req, res) => {
  try {
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const [users] = await pool.execute(`
      SELECT 
        id, email, first_name, last_name, gender, dob, 
        current_location, profile_pic_url, intent, 
        onboarding_complete, approval, created_at, updated_at
      FROM users 
      WHERE approval = false
      ORDER BY created_at ASC
    `);

    // Transform and parse JSON fields
    const transformedUsers = users.map(user => {
      const intent = safeJsonParse(user.intent, {});
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        gender: user.gender,
        dob: user.dob,
        currentLocation: user.current_location,
        profilePicUrl: user.profile_pic_url,
        intent: intent,
        onboardingComplete: user.onboarding_complete,
        approval: user.approval,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        hasProfilePic: !!user.profile_pic_url,
        hasLifestyleImages: intent && intent.lifestyleImageUrls && intent.lifestyleImageUrls.filter(Boolean).length > 0,
        lifestyleImageCount: intent && intent.lifestyleImageUrls ? intent.lifestyleImageUrls.filter(Boolean).length : 0
      };
    });

    res.json({
      users: transformedUsers,
      total: transformedUsers.length
    });

  } catch (error) {
    console.error('Get waitlist error:', error);
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

    console.log(`Admin approval update for user ${userId}:`, { approval, reason });

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update approval status
    await pool.execute(
      'UPDATE users SET approval = ? WHERE id = ?',
      [approval, userId]
    );

    console.log(`User ${userId} (${existingUsers[0].email}) ${approval ? 'approved' : 'rejected'}`);

    res.json({ 
      message: `User ${approval ? 'approved' : 'rejected'} successfully`,
      userId: userId,
      approval: approval
    });

  } catch (error) {
    console.error('Update approval error:', error);
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

    const [users] = await pool.execute(`
      SELECT 
        id, email, first_name, last_name, gender, dob, 
        current_location, favourite_travel_destination, last_holiday_places, 
        favourite_places_to_go, profile_pic_url, intent, 
        onboarding_complete, approval, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Parse JSON fields
    const lastHolidayPlaces = safeJsonParse(user.last_holiday_places, []);
    const favouritePlacesToGo = safeJsonParse(user.favourite_places_to_go, []);
    const intent = safeJsonParse(user.intent, {});

    // Transform to frontend format
    const transformedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      gender: user.gender,
      dob: user.dob,
      currentLocation: user.current_location,
      favouriteTravelDestination: user.favourite_travel_destination,
      lastHolidayPlaces: lastHolidayPlaces,
      favouritePlacesToGo: favouritePlacesToGo,
      profilePicUrl: user.profile_pic_url,
      intent: intent,
      onboardingComplete: user.onboarding_complete,
      approval: user.approval,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null
    };

    res.json(transformedUser);

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Get admin dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    console.log('📊 Admin dashboard request received');
    
    if (!(await validateConnection())) {
      console.log('❌ Database connection failed');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    console.log('✅ Database connection validated');

    // Get total users
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalResult[0].total;

    // Get approved users
    const [approvedResult] = await pool.execute('SELECT COUNT(*) as approved FROM users WHERE approval = true');
    const approvedUsers = approvedResult[0].approved;

    // Get pending users
    const [pendingResult] = await pool.execute('SELECT COUNT(*) as pending FROM users WHERE approval = false');
    const pendingUsers = pendingResult[0].pending;

    // Get users with completed onboarding
    const [onboardingResult] = await pool.execute('SELECT COUNT(*) as completed FROM users WHERE onboarding_complete = true');
    const completedOnboarding = onboardingResult[0].completed;

    // Get users with profile pictures
    const [profilePicResult] = await pool.execute('SELECT COUNT(*) as withPic FROM users WHERE profile_pic_url IS NOT NULL');
    const usersWithProfilePic = profilePicResult[0].withPic;

    // Get recent registrations (last 7 days)
    const [recentResult] = await pool.execute(`
      SELECT COUNT(*) as recent FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
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

    console.log('📈 Dashboard stats calculated:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

module.exports = router; 
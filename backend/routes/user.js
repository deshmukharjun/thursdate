const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper function to handle different pool methods and placeholders
const executeQuery = async (query, params) => {
  if (pool.query) { // For PostgreSQL
    const result = await pool.query(query, params);
    // console.log("PostgreSQL query result:", result.rows);
    return [result.rows];
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

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const [users] = await executeQuery(
      `SELECT id, email, first_name, last_name, gender, dob, current_location, 
       favourite_travel_destination, last_holiday_places, favourite_places_to_go, 
       profile_pic_url, approval, intent, onboarding_complete, is_private 
       FROM users WHERE id = $1`,
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    const transformedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      gender: user.gender,
      dob: user.dob,
      currentLocation: user.current_location,
      favouriteTravelDestination: user.favourite_travel_destination,
      lastHolidayPlaces: safeJsonParse(user.last_holiday_places, []),
      favouritePlacesToGo: safeJsonParse(user.favourite_places_to_go, []),
      profilePicUrl: user.profile_pic_url,
      intent: safeJsonParse(user.intent, {}),
      onboardingComplete: user.onboarding_complete,
      approval: user.approval,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isPrivate: user.is_private,
    };
    
    res.json(transformedUser);
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Save user profile (for onboarding)
router.post('/profile', auth, async (req, res) => {
  try {
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const {
      firstName, lastName, gender, dob, currentLocation, favouriteTravelDestination,
      lastHolidayPlaces, favouritePlacesToGo, profilePicUrl
    } = req.body;
    
    const formattedDob = dob ? new Date(dob).toISOString().split('T')[0] : null;
    const lastHolidayPlacesJson = JSON.stringify(lastHolidayPlaces || []);
    const favouritePlacesToGoJson = JSON.stringify(favouritePlacesToGo || []);
    
    await executeQuery(
      `UPDATE users SET 
        first_name = $1, last_name = $2, gender = $3, dob = $4, 
        current_location = $5, favourite_travel_destination = $6, 
        last_holiday_places = $7, favourite_places_to_go = $8, 
        profile_pic_url = $9, approval = false
      WHERE id = $10`,
      [
        firstName, lastName, gender, formattedDob, currentLocation, 
        favouriteTravelDestination, lastHolidayPlacesJson, 
        favouritePlacesToGoJson, profilePicUrl, req.user.userId
      ]
    );
    
    res.json({ message: 'Profile saved successfully' });
    
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const [currentUsers] = await executeQuery('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    if (currentUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUser = currentUsers[0];
    const currentIntent = safeJsonParse(currentUser.intent, {});
    
    const {
      firstName, lastName, gender, dob, currentLocation, favouriteTravelDestination,
      lastHolidayPlaces, favouritePlacesToGo, profilePicUrl, intent, onboardingComplete,
      isPrivate
    } = req.body;
    
    const finalIntent = { ...currentIntent, ...intent };
    const intentJson = finalIntent ? JSON.stringify(finalIntent) : currentUser.intent;
    
    const updateData = [
      firstName !== undefined ? firstName : currentUser.first_name,
      lastName !== undefined ? lastName : currentUser.last_name,
      gender !== undefined ? gender : currentUser.gender,
      dob ? new Date(dob).toISOString().split('T')[0] : currentUser.dob,
      currentLocation !== undefined ? currentLocation : currentUser.current_location,
      favouriteTravelDestination !== undefined ? favouriteTravelDestination : currentUser.favourite_travel_destination,
      JSON.stringify(lastHolidayPlaces || safeJsonParse(currentUser.last_holiday_places, [])),
      JSON.stringify(favouritePlacesToGo || safeJsonParse(currentUser.favourite_places_to_go, [])),
      profilePicUrl !== undefined ? profilePicUrl : currentUser.profile_pic_url,
      intentJson,
      onboardingComplete !== undefined ? onboardingComplete : currentUser.onboarding_complete,
      isPrivate !== undefined ? isPrivate : currentUser.is_private,
      req.user.userId
    ];
    
    await executeQuery(
      `UPDATE users SET 
        first_name = $1, last_name = $2, gender = $3, dob = $4, 
        current_location = $5, favourite_travel_destination = $6, 
        last_holiday_places = $7, favourite_places_to_go = $8, 
        profile_pic_url = $9, intent = $10, onboarding_complete = $11,
        is_private = $12
      WHERE id = $13`,
      updateData
    );
    
    res.json({ message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Admin endpoint to update user approval status
router.put('/approve/:userId', auth, async (req, res) => {
  try {
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const { userId } = req.params;
    const { approval } = req.body;

    if (approval === undefined) {
        return res.status(400).json({ error: 'Approval status is required' });
    }
    
    // Note: pg library does not return affectedRows directly, you would typically check result.rowCount
    const [result] = await executeQuery(
      'UPDATE users SET approval = $1 WHERE id = $2',
      [approval, userId]
    );

    if (result.affectedRows === 0) { // This line may need to be adjusted for pg
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User approval status updated successfully' });
    
  } catch (error) {
    console.error('Update approval error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

module.exports = router;
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

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // Validate database connection
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, gender, dob, current_location, favourite_travel_destination, last_holiday_places, favourite_places_to_go, profile_pic_url, approval, intent, onboarding_complete FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Safely parse JSON fields with error handling
    const lastHolidayPlaces = safeJsonParse(user.last_holiday_places, []);
    const favouritePlacesToGo = safeJsonParse(user.favourite_places_to_go, []);
    const intent = safeJsonParse(user.intent, {});
    
    // Transform database column names to frontend field names
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
      updatedAt: user.updated_at
    };
    
    console.log('User profile data being sent:', {
      firstName: transformedUser.firstName,
      lastName: transformedUser.lastName,
      profilePicUrl: transformedUser.profilePicUrl,
      gender: transformedUser.gender,
      dob: transformedUser.dob,
      intent: transformedUser.intent ? 'Present' : 'Null'
    });
    
    res.json(transformedUser);
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Save user profile (for onboarding)
router.post('/profile', auth, async (req, res) => {
  try {
    // Validate database connection
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const {
      firstName,
      lastName,
      gender,
      dob,
      currentLocation,
      favouriteTravelDestination,
      lastHolidayPlaces,
      favouritePlacesToGo,
      profilePicUrl
    } = req.body;
    
    // Convert date format for MySQL
    let formattedDob = null;
    if (dob) {
      try {
        const date = new Date(dob);
        formattedDob = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      } catch (error) {
        console.error('Date conversion error:', error);
        formattedDob = null;
      }
    }
    
    // Convert arrays to JSON strings for storage
    const lastHolidayPlacesJson = JSON.stringify(lastHolidayPlaces || []);
    const favouritePlacesToGoJson = JSON.stringify(favouritePlacesToGo || []);
    
    await pool.execute(
      `UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        gender = ?, 
        dob = ?, 
        current_location = ?, 
        favourite_travel_destination = ?, 
        last_holiday_places = ?, 
        favourite_places_to_go = ?, 
        profile_pic_url = ?,
        approval = false
      WHERE id = ?`,
      [
        firstName,
        lastName,
        gender,
        formattedDob,
        currentLocation,
        favouriteTravelDestination,
        lastHolidayPlacesJson,
        favouritePlacesToGoJson,
        profilePicUrl,
        req.user.userId
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
    // Validate database connection
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    console.log('Profile update attempt for user ID:', req.user.userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // First, get the current user data
    const [currentUsers] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (currentUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUser = currentUsers[0];
    
    // Safely parse existing JSON fields
    const currentIntent = safeJsonParse(currentUser.intent, {});
    
    const {
      firstName,
      lastName,
      gender,
      dob,
      currentLocation,
      favouriteTravelDestination,
      lastHolidayPlaces,
      favouritePlacesToGo,
      profilePicUrl,
      intent,
      onboardingComplete
    } = req.body;
    
    // Merge intent data if provided
    let finalIntent = currentIntent;
    if (intent) {
      finalIntent = { ...currentIntent, ...intent };
    }
    
    // Convert arrays to JSON strings for storage and handle undefined values
    const lastHolidayPlacesJson = JSON.stringify(lastHolidayPlaces || safeJsonParse(currentUser.last_holiday_places, []) || []);
    const favouritePlacesToGoJson = JSON.stringify(favouritePlacesToGo || safeJsonParse(currentUser.favourite_places_to_go, []) || []);
    const intentJson = finalIntent ? JSON.stringify(finalIntent) : null;
    
    // Convert date format for MySQL
    let formattedDob = null;
    if (dob) {
      try {
        const date = new Date(dob);
        formattedDob = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      } catch (error) {
        console.error('Date conversion error:', error);
        formattedDob = currentUser.dob;
      }
    } else {
      formattedDob = currentUser.dob;
    }
    
    // Use provided values or fall back to current values
    const updateData = [
      firstName !== undefined ? firstName : currentUser.first_name,
      lastName !== undefined ? lastName : currentUser.last_name,
      gender !== undefined ? gender : currentUser.gender,
      formattedDob,
      currentLocation !== undefined ? currentLocation : currentUser.current_location,
      favouriteTravelDestination !== undefined ? favouriteTravelDestination : currentUser.favourite_travel_destination,
      lastHolidayPlacesJson,
      favouritePlacesToGoJson,
      profilePicUrl !== undefined ? profilePicUrl : currentUser.profile_pic_url,
      intentJson,
      onboardingComplete !== undefined ? onboardingComplete : currentUser.onboarding_complete,
      req.user.userId
    ];
    
    console.log('Prepared data:', {
      intentJson: intentJson ? 'Present' : 'Null',
      onboardingComplete: onboardingComplete !== undefined ? onboardingComplete : currentUser.onboarding_complete,
      updateDataLength: updateData.length,
      currentIntentKeys: Object.keys(currentIntent),
      finalIntentKeys: Object.keys(finalIntent)
    });
    
    await pool.execute(
      `UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        gender = ?, 
        dob = ?, 
        current_location = ?, 
        favourite_travel_destination = ?, 
        last_holiday_places = ?, 
        favourite_places_to_go = ?, 
        profile_pic_url = ?,
        intent = ?,
        onboarding_complete = ?
      WHERE id = ?`,
      updateData
    );
    
    console.log('Profile update successful');
    res.json({ message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Admin endpoint to update user approval status
router.put('/approve/:userId', auth, async (req, res) => {
  try {
    // Validate database connection
    if (!(await validateConnection())) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const { userId } = req.params;
    const { approval } = req.body;
    
    await pool.execute(
      'UPDATE users SET approval = ? WHERE id = ?',
      [approval, userId]
    );
    
    res.json({ message: 'User approval status updated successfully' });
    
  } catch (error) {
    console.error('Update approval error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

module.exports = router; 
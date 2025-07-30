require('dotenv').config();
const pool = require('./config/db');

async function diagnoseDatabase() {
  console.log('🔍 Starting database diagnosis...\n');
  
  try {
    // Test connection
    console.log('1. Testing database connection...');
    await pool.execute('SELECT 1');
    console.log('✅ Database connection successful\n');
    
    // Check table structure
    console.log('2. Checking table structure...');
    const [columns] = await pool.execute('DESCRIBE users');
    console.log('✅ Users table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    console.log('');
    
    // Check for users with null data
    console.log('3. Checking for users with null data...');
    const [nullUsers] = await pool.execute(`
      SELECT id, email, 
             first_name IS NULL as first_name_null,
             last_name IS NULL as last_name_null,
             gender IS NULL as gender_null,
             dob IS NULL as dob_null,
             current_location IS NULL as current_location_null,
             profile_pic_url IS NULL as profile_pic_url_null,
             intent IS NULL as intent_null
      FROM users
    `);
    
    if (nullUsers.length === 0) {
      console.log('✅ No users found in database');
    } else {
      console.log(`📊 Found ${nullUsers.length} users:`);
      nullUsers.forEach(user => {
        const nullFields = [];
        if (user.first_name_null) nullFields.push('first_name');
        if (user.last_name_null) nullFields.push('last_name');
        if (user.gender_null) nullFields.push('gender');
        if (user.dob_null) nullFields.push('dob');
        if (user.current_location_null) nullFields.push('current_location');
        if (user.profile_pic_url_null) nullFields.push('profile_pic_url');
        if (user.intent_null) nullFields.push('intent');
        
        console.log(`   User ${user.id} (${user.email}): ${nullFields.length > 0 ? nullFields.join(', ') : 'No null fields'}`);
      });
    }
    console.log('');
    
    // Check for malformed JSON in intent field
    console.log('4. Checking for malformed JSON in intent field...');
    const [intentUsers] = await pool.execute('SELECT id, email, intent FROM users WHERE intent IS NOT NULL');
    
    let malformedCount = 0;
    intentUsers.forEach(user => {
      try {
        JSON.parse(user.intent);
      } catch (error) {
        malformedCount++;
        console.log(`   ❌ User ${user.id} (${user.email}) has malformed intent JSON: ${error.message}`);
      }
    });
    
    if (malformedCount === 0) {
      console.log('✅ All intent JSON fields are valid');
    } else {
      console.log(`❌ Found ${malformedCount} users with malformed intent JSON`);
    }
    console.log('');
    
    // Check recent updates
    console.log('5. Checking recent user updates...');
    const [recentUpdates] = await pool.execute(`
      SELECT id, email, updated_at, 
             first_name, last_name, gender, profile_pic_url
      FROM users 
      ORDER BY updated_at DESC 
      LIMIT 5
    `);
    
    console.log('📅 Recent user updates:');
    recentUpdates.forEach(user => {
      console.log(`   User ${user.id} (${user.email}) - Updated: ${user.updated_at}`);
      console.log(`     Name: ${user.first_name || 'NULL'} ${user.last_name || 'NULL'}`);
      console.log(`     Gender: ${user.gender || 'NULL'}`);
      console.log(`     Profile Pic: ${user.profile_pic_url ? 'Set' : 'NULL'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
    console.log('🔍 Database diagnosis complete');
  }
}

// Run diagnosis
diagnoseDatabase(); 
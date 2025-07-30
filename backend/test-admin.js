require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminRoutes() {
  console.log('🧪 Testing Admin Routes...\n');

  try {
    // Test 1: Try to access admin dashboard without auth
    console.log('1. Testing admin dashboard without authentication...');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`);
      const data = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test 2: Try to access admin users without auth
    console.log('\n2. Testing admin users without authentication...');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      const data = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test 3: Check if server is running
    console.log('\n3. Testing server connectivity...');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      });
      console.log(`   Status: ${response.status}`);
      console.log('   Server is responding');
    } catch (error) {
      console.log(`   Error: ${error.message}`);
      console.log('   Server might not be running');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminRoutes(); 
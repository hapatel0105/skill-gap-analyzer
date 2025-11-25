const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3001/api';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ovxwrecjifbmqcoqmlkg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eHdyZWNqaWZibXFjb3FtbGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzgzOTksImV4cCI6MjA3MDg1NDM5OX0.fcfZ9ir4HL0MZTVXs7UL3BwUWU6mbAuo1rwJuu9biJU';

// Mock user credentials
const EMAIL = 'test@example.com';
const PASSWORD = 'Password123!';

async function main() {
  try {
    console.log('1. Authenticating with Supabase...');
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      // Try signing up if login fails
      console.log('Login failed, trying signup...');
      const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      
      const signupData = await signupResponse.json();
      if (!signupResponse.ok) {
        throw new Error(`Auth failed: ${JSON.stringify(signupData)}`);
      }
      console.log('Signup successful, please check email if verification is required. Using returned token if available.');
      if (!signupData.access_token) {
        throw new Error('Signup required email verification. Cannot proceed automatically.');
      }
      authData.access_token = signupData.access_token;
    }

    const token = authData.access_token;
    console.log('Authentication successful.');

    console.log('2. Creating dummy resume file...');
    const resumePath = path.join(__dirname, 'dummy_resume.txt');
    fs.writeFileSync(resumePath, 'This is a test resume. Skills: JavaScript, TypeScript, Node.js.');

    console.log('3. Uploading resume...');
    const formData = new FormData();
    const fileContent = fs.readFileSync(resumePath);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('resume', blob, 'dummy_resume.txt');
    formData.append('title', 'Test Resume');

    const uploadResponse = await fetch(`${API_URL}/resume/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const uploadResult = await uploadResponse.json();
    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));

    // Cleanup
    fs.unlinkSync(resumePath);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();

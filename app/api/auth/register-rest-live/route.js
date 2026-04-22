export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name, preferredCurrency } = req.body;

  // Validate inputs
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields: email, password, name' });
  }

  try {
    // Import bcryptjs
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

    // Use Supabase REST API to insert user
    const response = await fetch(`${supabaseUrl}/rest/v1/auth_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        name,
        email,
        password_hash: passwordHash,
        preferred_currency: preferredCurrency || 'USD',
        is_active: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Supabase error:', errorData);
      return res.status(response.status).json({ error: 'Failed to create user', details: errorData });
    }

    const user = await response.json();
    console.log('User created:', user);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';
    const token = jwt.sign(
      { id: user[0]?.id || 1, email, name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      user: {
        id: user[0]?.id,
        name: user[0]?.name,
        email: user[0]?.email,
        preferredCurrency: user[0]?.preferred_currency,
      },
      token,
      message: 'User registered successfully using REST API',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message,
      details: error.toString(),
    });
  }
}

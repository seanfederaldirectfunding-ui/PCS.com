const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('@utils/database');

// Simple registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT user_id FROM page_users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email or username'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO page_users (username, email, password_hash, phone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, username, email, phone, role, created_at`,
      [username, email, hashedPassword, phone]
    );

    res.json({
      success: true,
      user: result.rows[0],
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Simple login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await db.query(
      `SELECT user_id, username, email, password_hash, phone, role 
       FROM page_users 
       WHERE (email = $1 OR username = $1) AND is_active = true`,
      [identifier]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const userData = user.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Return user data (in production, you'd generate a JWT token)
    res.json({
      success: true,
      user: {
        userId: userData.user_id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
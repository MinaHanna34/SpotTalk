const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// Username validation helper
const validateUsername = (username) => {
    if (username.length < 2 || username.length > 32) {
        return "Username must be between 2 and 32 characters";
    }
    if (!/^[a-z0-9._]+$/.test(username)) {
        return "Username can only contain lowercase letters, numbers, periods, and underscores";
    }
    if (/^[._]|[._]$|[.]{2}|[_]{2}/.test(username)) {
        return "Username cannot start or end with a period or underscore";
    }
    return null;
};

// Password validation helper
const validatePassword = (password) => {
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        return "Password must contain at least one special character";
    }
    if (/\s/.test(password)) {
        return "Password should not contain spaces";
    }
    return null;
};

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate username
        const usernameError = validateUsername(username);
        if (usernameError) {
            return res.status(400).json({ error: usernameError });
        }

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            const existingUser = userExists.rows[0];
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Set session data
        req.session.user = {
            id: newUser.rows[0].id,
            username: newUser.rows[0].username,
            email: newUser.rows[0].email
        };

        // Set cookie
        res.cookie('user', JSON.stringify({
            id: newUser.rows[0].id,
            username: newUser.rows[0].username
        }), {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                email: newUser.rows[0].email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Get current user
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user exists
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Set session data
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        // Set cookie
        res.cookie('user', JSON.stringify({
            id: user.id,
            username: user.username
        }), {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        // Send response
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('user');
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router; 
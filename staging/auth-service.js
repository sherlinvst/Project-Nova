//This is the initialization of auth-service.js 
// authService.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const users = []; // mock database

const JWT_SECRET = "your_secret_key";

// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: Date.now(),
            email,
            password: hashedPassword
        };

        users.push(newUser);

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful (feature branch)",
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ======================
// AUTH MIDDLEWARE
// ======================
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid token"
            });
        }

        req.user = user;
        next();
    });
}

// ======================
// PROTECTED ROUTE
// ======================
router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Protected profile data",
        user: req.user
    });
});

module.exports = router;
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import employemodule from './models/usermodel.js';  // Employee model
import bd from './bd.js';  // Database connection
import { config } from 'dotenv';

const app = express();
config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());

const allowedOrigins = ["https://benevolent-zabaione-4aa71d.netlify.app"];

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // Allow the request if no origin or it's an allowed origin
    } else {
      callback(new Error('Not allowed by CORS'));  // Reject the request if the origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],  // Make sure OPTIONS is allowed for preflight
  credentials: true,  // Allow cookies to be sent along with requests
}));

app.use(express.json());

// Database connection
bd();

// Default route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = await employemodule.create({ username, password: hashedPassword, email });
    res.json(newEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await employemodule.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }
    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Middleware to verify JWT token
const verify = (req, res, next) => {
  const token = req.cookies.token;  // Fetch token from cookies
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Logout route (clear the cookie)
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Only true in production (HTTPS)
    sameSite: 'strict',  // CSRF protection
    path: '/',
  });
  res.status(200).send('Logged out');
});

// Protected route (home)
app.post('/home', verify, (req, res) => {
  res.json('success');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

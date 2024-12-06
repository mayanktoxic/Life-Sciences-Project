const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create Express App
const app = express();
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Replace with your MySQL username
    password: 'AnubhutiSheetal@02', // Replace with your MySQL password
    database: 'practice'
});


db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Authentication layer
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// Role-based Authorization Middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    next();
  };
};

// --- Profiles CRUD Operations ---
app.get('/api/profiles', authenticate, (req, res) => {
  const query = 'SELECT * FROM profiles';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ profiles: results });
  });
});

app.post('/api/profiles', authenticate, authorize(['Super Admin']), (req, res) => {
  const { name, role, email, startDate, endDate, isActive } = req.body;
  const query = 'INSERT INTO profiles (name, role, email, startDate, endDate, isActive) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, role, email, startDate, endDate, isActive], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding profile' });
    res.status(201).json({ message: 'Profile added successfully' });
  });
});

app.put('/api/profiles/:id', authenticate, authorize(['Super Admin']), (req, res) => {
  const { id } = req.params;
  const { name, role, email, startDate, endDate, isActive } = req.body;
  const query = 'UPDATE profiles SET name = ?, role = ?, email = ?, startDate = ?, endDate = ?, isActive = ? WHERE id = ?';
  db.query(query, [name, role, email, startDate, endDate, isActive, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating profile' });
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

app.delete('/api/profiles/:id', authenticate, authorize(['Super Admin']), (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM profiles WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting profile' });
    res.status(200).json({ message: 'Profile deleted successfully' });
  });
});

// --- Projects CRUD Operations ---
app.get('/api/projects', authenticate, (req, res) => {
  const query = 'SELECT * FROM projects';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ projects: results });
  });
});

app.post('/api/projects', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { title, capital, fundedBy, startDate, endDate } = req.body;
  const query = 'INSERT INTO projects (title, capital, fundedBy, startDate, endDate) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [title, capital, fundedBy, startDate, endDate], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding project' });
    res.status(201).json({ message: 'Project added successfully' });
  });
});

app.put('/api/projects/:id', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.params;
  const { title, capital, fundedBy, startDate, endDate } = req.body;
  const query = 'UPDATE projects SET title = ?, capital = ?, fundedBy = ?, startDate = ?, endDate = ? WHERE id = ?';
  db.query(query, [title, capital, fundedBy, startDate, endDate, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating project' });
    res.status(200).json({ message: 'Project updated successfully' });
  });
});

app.delete('/api/projects/:id', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM projects WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting project' });
    res.status(200).json({ message: 'Project deleted successfully' });
  });
});

// --- Indents CRUD Operations ---
app.get('/api/indents', authenticate, (req, res) => {
  const query = 'SELECT * FROM indents';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ indents: results });
  });
});

// --- Purchase Requests CRUD Operations ---
app.get('/api/purchaseReqs', authenticate, (req, res) => {
  const query = 'SELECT * FROM purchase_reqs';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ purchaseReqs: results });
  });
});

// --- User Registration & Authentication ---
app.post('/api/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, hashedPassword, role], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error registering user' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (!isValid) return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});


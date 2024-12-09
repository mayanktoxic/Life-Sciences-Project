const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
console.log(process.env.SECRET_KEY);
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

// Authentication Middleware

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  console.log(token);
  try {
    const decoded = jwt.decode(token, "mySecret123");
    console.log(decoded);
    req.user = decoded;
    console.log(req);
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: 'Invalid token' });
  }
};
// Role-based Authorization Middleware
const authorize = (roles) => {
  return (req, res, next) => {
    console.log(req.body.role);
    if (!roles.includes(req.body.role)) {
    return res.status(403).json({ message: 'Permission denied' });
    }
    next();
  };
};

// --- Profiles CRUD Operations ---
app.get('/api/users', authenticate, (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ profiles: results });
  });
});

app.post('/api/users', authenticate, authorize(['Super Admin']), (req, res) => {
  const { id,name,email,password,designation,status } = req.body;
  
  const query = 'INSERT INTO users(id,name,email,password,designation,status) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [id,name,email,password,designation,status], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding profile', err : err.message });
    res.status(201).json({ message: 'Profile added successfully' });
  });
});

app.put('/api/users', authenticate, authorize(['Super Admin']), (req, res) => {
  // const { id }  = req.params;
  const {id,name,email,password,designation,status } = req.body;
  db.query('UPDATE users SET id = ?, name = ?, email = ?, password = ?, designation = ?, status = ? WHERE id = ?', [id,name,email,password,designation,status,id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating profile',message : err.message });
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

app.delete('/api/users/', authenticate, authorize(['Super Admin']), (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting profile' , message : err.message });
    res.status(200).json({ message: 'Profile deleted successfully'});
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
  const { ProjectTitle, ProjectNo, ProjectStartDate, ProjectEndDate,SanctionOrderNo,TotalSanctionamount,PIname,CoPIs,ManpowerAllocationAmt,ConsumablesAllocationAmt,ContingencyAllocationAmt,OverheadAllocationAmt,EquipmentAllocationAmt,TravelAllocationAmt } = req.body;
  const query = 'INSERT INTO projects (ProjectTitle, ProjectNo, ProjectStartDate, ProjectEndDate,SanctionOrderNo,TotalSanctionamount,PIname,CoPIs,ManpowerAllocationAmt,ConsumablesAllocationAmt,ContingencyAllocationAmt,OverheadAllocationAmt,EquipmentAllocationAmt,TravelAllocationAmt ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  db.query(query, [ProjectTitle, ProjectNo, ProjectStartDate, ProjectEndDate,SanctionOrderNo,TotalSanctionamount,PIname,CoPIs,ManpowerAllocationAmt,ConsumablesAllocationAmt,ContingencyAllocationAmt,OverheadAllocationAmt,EquipmentAllocationAmt,TravelAllocationAmt], (err, result) => {
    if (err) {console.log(err);return res.status(500).json({ message: 'Error adding project', message2 : err.message })};
    res.status(201).json({ message: 'Project added successfully' });
  });
});

app.put('/api/projects/:id', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.body;
  const { ProjectTitle, ProjectNo, ProjectStartDate, ProjectEndDate,SanctionOrderNo,TotalSanctionamount,PIname,CoPIs,ManpowerAllocationAmt,ConsumablesAllocationAmt,ContingencyAllocationAmt,OverheadAllocationAmt,EquipmentAllocationAmt,TravelAllocationAmt } = req.body;
  const query = 'UPDATE projects SET ProjectTitle = ?, ProjectNo = ?, ProjectStartDate = ?, ProjectEndDate = ?, SanctionOrderNo = ?, TotalSanctionamount = ?, PIname = ?, CoPIs = ?, ManpowerAllocationAmt = ?, ConsumablesAllocationAmt = ?, ContingencyAllocationAmt = ?, OverheadAllocationAmt = ?, EquipmentAllocationAmt = ?, TravelAllocationAmt = ? WHERE id = ?';
  db.query(query, [ProjectTitle, ProjectNo, ProjectStartDate, ProjectEndDate,SanctionOrderNo,TotalSanctionamount,PIname,CoPIs,ManpowerAllocationAmt,ConsumablesAllocationAmt,ContingencyAllocationAmt,OverheadAllocationAmt,EquipmentAllocationAmt,TravelAllocationAmt], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating project' });
    res.status(200).json({ message: 'Project updated successfully' });
  });
});

app.delete('/api/projects/:id', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM projects WHERE ProjectNo = ?';
  db.query(query, [id], (err, result) => {
    if (err){console.log(err);return res.status(500).json({ message: 'Error deleting project' })};
    res.status(200).json({ message: 'Project deleted successfully' });
  });
});

// --- Indents CRUD Operations ---// --- Indents CRUD Operations ---
app.get('/api/indents', authenticate, (req, res) => {
  const query = 'SELECT * FROM indents';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ indents: results });
  });
});

// Endpoint to Add an Indent - Scientists (PIs) are not allowed
app.post('/api/indents', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { title, description, amount } = req.body;
  const query = 'INSERT INTO indents (title, description, amount) VALUES (?, ?, ?)';
  db.query(query, [title, description, amount], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding indent' });
    res.status(201).json({ message: 'Indent added successfully' });
  });
});

// Endpoint to Update an Indent - Scientists (PIs) are not allowed
app.put('/api/indents/:id', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.params;
  const { title, description, amount } = req.body;
  
  const query = 'UPDATE indents SET title = ?, description = ?, amount = ? WHERE id = ?';
  db.query(query, [title, description, amount, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating indent' });
    res.status(200).json({ message: 'Indent updated successfully' });
  });
});

// Endpoint to Delete an Indent - Scientists (PIs) are not allowed
app.delete('/api/indents/:id', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM indents WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting indent' });
    res.status(200).json({ message: 'Indent deleted successfully' });
  });
});

// Endpoint to Upload a PDF for an Indent - Scientists (PIs) are not allowed
app.post('/api/indents/:id/uploadPdf', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.params;
  const { pdf } = req.body; // Assuming the PDF is sent as a base64 string

  if (!pdf) return res.status(400).json({ message: 'No PDF provided' });

  const query = 'UPDATE indents SET pdf = ? WHERE id = ?';
  db.query(query, [Buffer.from(pdf, 'base64'), id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error uploading PDF' });
    res.status(200).json({ message: 'PDF uploaded successfully' });
  });
});

// Endpoint to Retrieve a PDF for an Indent - Scientists (PIs) are allowed
app.get('/api/indents/:id/downloadPdf', authenticate, (req, res) => {
  const { id } = req.params;

  const query = 'SELECT pdf FROM indents WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Indent not found' });

    const pdf = results[0].pdf;

    if (!pdf) return res.status(404).json({ message: 'No PDF found for this indent' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="indent.pdf"');
    res.send(pdf);
  });
});

// Endpoint to Upload a PDF for an Indent
app.post('/api/indents/:id/uploadPdf', authenticate, authorize(['Super Admin', 'Admin(PME)']), (req, res) => {
  const { id } = req.params;
  const { pdf } = req.body; // Assuming the PDF is sent as a base64 string

  if (!pdf) return res.status(400).json({ message: 'No PDF provided' });

  const query = 'UPDATE indents SET pdf = ? WHERE id = ?';
  db.query(query, [Buffer.from(pdf, 'base64'), id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error uploading PDF' });
    res.status(200).json({ message: 'PDF uploaded successfully' });
  });
});

// Endpoint to Retrieve a PDF for an Indent
app.get('/api/indents/:id/downloadPdf', authenticate, (req, res) => {
  const { id } = req.params;

  const query = 'SELECT pdf FROM indents WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Indent not found' });

    const pdf = results[0].pdf;

    if (!pdf) return res.status(404).json({ message: 'No PDF found for this indent' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="indent.pdf"');
    res.send(pdf);
  });
});

// --- Purchase Requests CRUD Operations ---

// Get all purchase requests
app.get('/api/purchaseRequests', authenticate, (req, res) => {
  const query = 'SELECT * FROM purchase_requests';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ purchaseRequests: results });
  });
});

// Get a single purchase request by ID
app.get('/api/purchaseRequests/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM purchase_requests WHERE PurchaseReqID = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Purchase request not found' });
    res.status(200).json({ purchaseRequest: results[0] });
  });
});

// Create a new purchase request
app.post('/api/purchaseRequests', authenticate, (req, res) => {
  const { PRDate, ProjectNo, IndentID, PurchaseRequestAmount, PRRequestor, PRStatus } = req.body;
  const query = 'INSERT INTO purchase_requests (PRDate, ProjectNo, IndentID, PurchaseRequestAmount, PRRequestor, PRStatus) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [PRDate, ProjectNo, IndentID, PurchaseRequestAmount, PRRequestor, PRStatus], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding purchase request' });
    res.status(201).json({ message: 'Purchase request added successfully' });
  });
});

// Update a purchase request
app.put('/api/purchaseRequests/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { PRDate, ProjectNo, IndentID, PurchaseRequestAmount, PRRequestor, PRStatus } = req.body;
  const query = 'UPDATE purchase_requests SET PRDate = ?, ProjectNo = ?, IndentID = ?, PurchaseRequestAmount = ?, PRRequestor = ?, PRStatus = ? WHERE PurchaseReqID = ?';
  db.query(query, [PRDate, ProjectNo, IndentID, PurchaseRequestAmount, PRRequestor, PRStatus, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating purchase request' });
    res.status(200).json({ message: 'Purchase request updated successfully' });
  });
});

// Delete a purchase request
app.delete('/api/purchaseRequests/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM purchase_requests WHERE PurchaseReqID = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting purchase request' });
    res.status(200).json({ message: 'Purchase request deleted successfully' });
  });
});

// --- Purchase Orders CRUD Operations ---

// Get all purchase orders
app.get('/api/purchaseOrders', authenticate, (req, res) => {
  const query = 'SELECT * FROM purchase_orders';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ purchaseOrders: results });
  });
});

// Get a single purchase order by ID
app.get('/api/purchaseOrders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM purchase_orders WHERE PurchaseOrderID = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Purchase order not found' });
    res.status(200).json({ purchaseOrder: results[0] });
  });
});

// Create a new purchase order
app.post('/api/purchaseOrders', authenticate, (req, res) => {
  const { PODate, ProjectNo, PurchaseReqID, PurchaseOrderAmount, PORequestor, POStatus } = req.body;
  const query = 'INSERT INTO purchase_orders (PODate, ProjectNo, PurchaseReqID, PurchaseOrderAmount, PORequestor, POStatus) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [PODate, ProjectNo, PurchaseReqID, PurchaseOrderAmount, PORequestor, POStatus], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding purchase order' });
    res.status(201).json({ message: 'Purchase order added successfully' });
  });
});

// Update a purchase order
app.put('/api/purchaseOrders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { PODate, ProjectNo, PurchaseReqID, PurchaseOrderAmount, PORequestor, POStatus } = req.body;
  const query = 'UPDATE purchase_orders SET PODate = ?, ProjectNo = ?, PurchaseReqID = ?, PurchaseOrderAmount = ?, PORequestor = ?, POStatus = ? WHERE PurchaseOrderID = ?';
  db.query(query, [PODate, ProjectNo, PurchaseReqID, PurchaseOrderAmount, PORequestor, POStatus, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating purchase order' });
    res.status(200).json({ message: 'Purchase order updated successfully' });
  });
});

// Delete a purchase order
app.delete('/api/purchaseOrders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM purchase_orders WHERE PurchaseOrderID = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting purchase order' });
    res.status(200).json({ message: 'Purchase order deleted successfully' });
  });
});

// --- Manpower CRUD Operations ---

// Get all manpower records
app.get('/api/manpower', authenticate, (req, res) => {
  const query = 'SELECT * FROM manpower';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ manpower: results });
  });
});

// Get a specific manpower record by ID
app.get('/api/manpower/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM manpower WHERE ManpowerId = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Manpower record not found' });
    res.status(200).json({ manpower: results[0] });
  });
});

// Create a new manpower record
app.post('/api/manpower', authenticate, (req, res) => {
  const { ProjectNo, ProjectTitle, ManPowerRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'INSERT INTO manpower (ProjectNo, ProjectTitle, ManPowerRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ProjectNo, ProjectTitle, ManPowerRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding manpower record' });
    res.status(201).json({ message: 'Manpower record added successfully' });
  });
});

// Update a manpower record by ID
app.put('/api/manpower/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProjectNo, ProjectTitle, ManPowerRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'UPDATE manpower SET ProjectNo = ?, ProjectTitle = ?, ManPowerRequestedAmt = ?, IndentID = ?, RequestedMonth = ?, RequestedYear = ?, BillCopy = ? WHERE ManpowerId = ?';
  db.query(query, [ProjectNo, ProjectTitle, ManPowerRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating manpower record' });
    res.status(200).json({ message: 'Manpower record updated successfully' });
  });
});

// Delete a manpower record by ID
app.delete('/api/manpower/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM manpower WHERE ManpowerId = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting manpower record' });
    res.status(200).json({ message: 'Manpower record deleted successfully' });
  });
});

// --- Consumables CRUD Operations ---

// Get all consumables records
app.get('/api/consumables', authenticate, (req, res) => {
  const query = 'SELECT * FROM consumables';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ consumables: results });
  });
});

// Get a specific consumables record by ID
app.get('/api/consumables/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM consumables WHERE ConsumablesId = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Consumables record not found' });
    res.status(200).json({ consumables: results[0] });
  });
});

// Create a new consumables record
app.post('/api/consumables', authenticate, (req, res) => {
  const { ProjectNo, ProjectTitle, ConsumablesRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'INSERT INTO consumables (ProjectNo, ProjectTitle, ConsumablesRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ProjectNo, ProjectTitle, ConsumablesRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding consumables record' });
    res.status(201).json({ message: 'Consumables record added successfully' });
  });
});

// Update a consumables record by ID
app.put('/api/consumables/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProjectNo, ProjectTitle, ConsumablesRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'UPDATE consumables SET ProjectNo = ?, ProjectTitle = ?, ConsumablesRequestedAmt = ?, IndentID = ?, RequestedMonth = ?, RequestedYear = ?, BillCopy = ? WHERE ConsumablesId = ?';
  db.query(query, [ProjectNo, ProjectTitle, ConsumablesRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating consumables record' });
    res.status(200).json({ message: 'Consumables record updated successfully' });
  });
});

// Delete a consumables record by ID
app.delete('/api/consumables/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM consumables WHERE ConsumablesId = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting consumables record' });
    res.status(200).json({ message: 'Consumables record deleted successfully' });
  });
});

// --- Contingency CRUD Operations ---

// Get all contingency records
app.get('/api/contingency', authenticate, (req, res) => {
  const query = 'SELECT * FROM contingency';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ contingency: results });
  });
});

// Get a specific contingency record by ID
app.get('/api/contingency/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM contingency WHERE ContingencyId = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Contingency record not found' });
    res.status(200).json({ contingency: results[0] });
  });
});

// Create a new contingency record
app.post('/api/contingency', authenticate, (req, res) => {
  const { ProjectNo, ProjectTitle, ContingencyRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'INSERT INTO contingency (ProjectNo, ProjectTitle, ContingencyRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ProjectNo, ProjectTitle, ContingencyRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding contingency record' });
    res.status(201).json({ message: 'Contingency record added successfully' });
  });
});

// Update a contingency record by ID
app.put('/api/contingency/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProjectNo, ProjectTitle, ContingencyRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'UPDATE contingency SET ProjectNo = ?, ProjectTitle = ?, ContingencyRequestedAmt = ?, IndentID = ?, RequestedMonth = ?, RequestedYear = ?, BillCopy = ? WHERE ContingencyId = ?';
  db.query(query, [ProjectNo, ProjectTitle, ContingencyRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating contingency record' });
    res.status(200).json({ message: 'Contingency record updated successfully' });
  });
});

// Delete a contingency record by ID
app.delete('/api/contingency/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM contingency WHERE ContingencyId = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting contingency record' });
    res.status(200).json({ message: 'Contingency record deleted successfully' });
  });
});

// --- Equipment CRUD Operations ---

// Get all equipment records
app.get('/api/equipment', authenticate, (req, res) => {
  const query = 'SELECT * FROM equipment';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ equipment: results });
  });
});

// Get a specific equipment record by ID
app.get('/api/equipment/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM equipment WHERE EquipmentId = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Equipment record not found' });
    res.status(200).json({ equipment: results[0] });
  });
});

// Create a new equipment record
app.post('/api/equipment', authenticate, (req, res) => {
  const { ProjectNo, ProjectTitle, EquipmentRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'INSERT INTO equipment (ProjectNo, ProjectTitle, EquipmentRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ProjectNo, ProjectTitle, EquipmentRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding equipment record' });
    res.status(201).json({ message: 'Equipment record added successfully' });
  });
});

// Update an equipment record by ID
app.put('/api/equipment/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProjectNo, ProjectTitle, EquipmentRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'UPDATE equipment SET ProjectNo = ?, ProjectTitle = ?, EquipmentRequestedAmt = ?, IndentID = ?, RequestedMonth = ?, RequestedYear = ?, BillCopy = ? WHERE EquipmentId = ?';
  db.query(query, [ProjectNo, ProjectTitle, EquipmentRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating equipment record' });
    res.status(200).json({ message: 'Equipment record updated successfully' });
  });
});

// Delete an equipment record by ID
app.delete('/api/equipment/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM equipment WHERE EquipmentId = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting equipment record' });
    res.status(200).json({ message: 'Equipment record deleted successfully' });
  });
});

// --- Overheads CRUD Operations ---

// Get all overhead records
app.get('/api/overheads', authenticate, (req, res) => {
  const query = 'SELECT * FROM overheads';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ overheads: results });
  });
});

// Get a specific overhead record by ID
app.get('/api/overheads/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM overheads WHERE OverheadId = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Overhead record not found' });
    res.status(200).json({ overhead: results[0] });
  });
});

// Create a new overhead record
app.post('/api/overheads', authenticate, (req, res) => {
  const { ProjectNo, ProjectTitle, OverheadRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'INSERT INTO overheads (ProjectNo, ProjectTitle, OverheadRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ProjectNo, ProjectTitle, OverheadRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding overhead record' });
    res.status(201).json({ message: 'Overhead record added successfully' });
  });
});

// Update an overhead record by ID
app.put('/api/overheads/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProjectNo, ProjectTitle, OverheadRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'UPDATE overheads SET ProjectNo = ?, ProjectTitle = ?, OverheadRequestedAmt = ?, IndentID = ?, RequestedMonth = ?, RequestedYear = ?, BillCopy = ? WHERE OverheadId = ?';
  db.query(query, [ProjectNo, ProjectTitle, OverheadRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating overhead record' });
    res.status(200).json({ message: 'Overhead record updated successfully' });
  });
});

// Delete an overhead record by ID
app.delete('/api/overheads/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM overheads WHERE OverheadId = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting overhead record' });
    res.status(200).json({ message: 'Overhead record deleted successfully' });
  });
});

// --- Travel CRUD Operations ---

// Get all travel records
app.get('/api/travel', authenticate, (req, res) => {
  const query = 'SELECT * FROM travel';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ travel: results });
  });
});

// Get a specific travel record by ID
app.get('/api/travel/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM travel WHERE TravelId = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Travel record not found' });
    res.status(200).json({ travel: results[0] });
  });
});

// Create a new travel record
app.post('/api/travel', authenticate, (req, res) => {
  const { ProjectNo, ProjectTitle, TravelRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'INSERT INTO travel (ProjectNo, ProjectTitle, TravelRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ProjectNo, ProjectTitle, TravelRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error adding travel record' });
    res.status(201).json({ message: 'Travel record added successfully' });
  });
});

// Update a travel record by ID
app.put('/api/travel/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProjectNo, ProjectTitle, TravelRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy } = req.body;
  const query = 'UPDATE travel SET ProjectNo = ?, ProjectTitle = ?, TravelRequestedAmt = ?, IndentID = ?, RequestedMonth = ?, RequestedYear = ?, BillCopy = ? WHERE TravelId = ?';
  db.query(query, [ProjectNo, ProjectTitle, TravelRequestedAmt, IndentID, RequestedMonth, RequestedYear, BillCopy, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating travel record' });
    res.status(200).json({ message: 'Travel record updated successfully' });
  });
});

// Delete a travel record by ID
app.delete('/api/travel/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM travel WHERE TravelId = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting travel record' });
    res.status(200).json({ message: 'Travel record deleted successfully' });
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



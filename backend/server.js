const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

function validateOpportunity(data) {
  const errors = [];

  const requiredFields = {
    title: 'Title',
    description: 'Description',
    research_area: 'Research area',
    faculty_name: 'Faculty name',
    department: 'Department',
    required_skills: 'Required skills',
    positions: 'Number of positions',
    deadline: 'Application deadline',
    status: 'Status'
  };

  for (const field in requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push(requiredFields[field] + ' is required');
    }
  }

  if (data.positions !== undefined && data.positions !== '') {
    const positions = Number(data.positions);
    if (!Number.isInteger(positions) || positions < 1) {
      errors.push('Number of positions must be a whole number of at least 1');
    }
  }

  if (data.deadline && isNaN(Date.parse(data.deadline))) {
    errors.push('Application deadline must be a valid date');
  }

  if (data.status && data.status !== 'Open' && data.status !== 'Closed') {
    errors.push('Status must be either Open or Closed');
  }

  return errors;
}

function isValidId(id) {
  return /^[1-9][0-9]*$/.test(id);
}

app.post('/api/opportunities', async (req, res) => {
  const errors = validateOpportunity(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors: errors });
  }

  try {
    const { title, description, research_area, faculty_name, department, required_skills, positions, deadline, status } = req.body;

    const [result] = await pool.query(
      'INSERT INTO opportunities (title, description, research_area, faculty_name, department, required_skills, positions, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, research_area, faculty_name, department, required_skills, positions, deadline, status]
    );

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/opportunities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM opportunities ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/opportunities/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid opportunity ID' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/opportunities/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid opportunity ID' });
  }

  const errors = validateOpportunity(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors: errors });
  }

  try {
    const { title, description, research_area, faculty_name, department, required_skills, positions, deadline, status } = req.body;

    const [result] = await pool.query(
      'UPDATE opportunities SET title = ?, description = ?, research_area = ?, faculty_name = ?, department = ?, required_skills = ?, positions = ?, deadline = ?, status = ? WHERE id = ?',
      [title, description, research_area, faculty_name, department, required_skills, positions, deadline, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/opportunities/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid opportunity ID' });
  }

  try {
    const [result] = await pool.query('DELETE FROM opportunities WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});

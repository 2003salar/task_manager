const express = require('express');
const router = express.Router();
const pool = require('../connectDB');
const isUserAuthenticated = require('./isUserAuthenticated');


// Get all projects for the request user
router.get('/', isUserAuthenticated, async (req, res) => {
    try { 
        const results = await pool.query('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
        res.status(200).json({success: true, data: results.rows});   
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Create a project
router.post('/', isUserAuthenticated, async (req, res) => {
    try {
        const {name, description} = req.body; 
        // Validating data coming from body
        if (!name || !description) {
            res.status(400).json({success: false, message: 'Missing required inputs'});
            return;
        }
        // Check if project already exists
        const existingProject = await pool.query('SELECT * FROM projects WHERE name = $1 and user_id = $2', [name, req.user.id]);
        if (existingProject.rows.length > 0) {
            res.status(400).json({success: false, message: 'Project already exists'});
            return;
        }
        // Else add the new project into DB
        const newProject = await pool.query(`INSERT INTO projects (name, description, user_id)
                        VALUES ($1, $2, $3) RETURNING id, name, created_at`, [name, description, req.user.id]);
        res.status(201).json({success: true, data: newProject.rows});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Create a task for a projects
router.post('/task', isUserAuthenticated, async (req, res) => {
    try {
        const {title, description, due_date, priority, project_id} = req.body;
        // Validatin of data coming from body
        if (!title || !due_date || !priority || !project_id) {
            res.status(400).json({success: false, message: 'Missing required inputs'});
            return;
        } 
        if (![1, 2, 3].includes(priority)) {
            res.status(400).json({success: false, message: 'Invalid priority'});
            return;
        }
        // Validating date
        const dueDate = new Date(due_date);
        if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
            res.status(400).json({ success: false, message: 'Invalid due date. Due date must be in the future.' });
            return;
        }
        // If the project does not exist
        const projectResults = await pool.query('SELECT * FROM projects WHERE id = $1', [project_id]);
        if (projectResults.rows.length === 0) {
            res.status(400).json({success: false, message: 'Project does not exist'});
            return;
        }
        // if task already exists in that project
        const existingProject = projectResults.rows[0];
        if (existingProject.user_id !== Number(req.user.id)) {
            res.status(403).json({ success: false, message: 'Access not authorized' });
            return;
        }
        const taskResults = await pool.query('SELECT * FROM tasks WHERE title = $1 AND project_id = $2', [title, project_id]);
        if (taskResults.rows.length > 0) {
            res.status(400).json({success: false, message: 'Task already exists'});
            return;
        }
        // Query and insert into DB
        let newTask;
        if (description) {
            newTask = await pool.query(`INSERT INTO tasks (title, description, due_date, priority, project_id, users_id)
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, due_date, priority`, [title, description, dueDate, priority, project_id, req.user.id]);
        }
        newTask = await pool.query(`INSERT INTO tasks (title, due_date, priority, project_id, users_id)
                                        VALUES ($1, $2, $3, $4, $5) RETURNING id, title, due_date, priority`, [title, dueDate, priority, project_id, req.user.id]);
        res.status(201).json({success: true, data: newTask.rows});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

module.exports = router;
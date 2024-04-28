const express = require('express');
const router = express.Router();
const pool = require('../connectDB');
const isUserAuthenticated = require('./isUserAuthenticated');
const projectTaskRouter = require('./projectTasks')

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


router.use('/task', projectTaskRouter)

module.exports = router;
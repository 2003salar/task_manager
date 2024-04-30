const express = require('express');
const router = express.Router();
const pool = require('../connectDB');
const isUserAuthenticated = require('./isUserAuthenticated');
const {Tasks} = require('../models');

// Get all tasks in a project  
router.get('/project/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({success: false, message: 'Invalid task'});
            return;
        } 
        const tasks = await Tasks.findAll({
            where: {
                project_id: id,
                users_id: req.user.id,
            },
        });
        res.status(200).json({success: true, data: tasks});       
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Create a task in a project
router.post('/', isUserAuthenticated, async (req, res) => {
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
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, description, dueDate, priority, project_id, req.user.id]);
        }else {
            newTask = await pool.query(`INSERT INTO tasks (title, due_date, priority, project_id, users_id)
                                        VALUES ($1, $2, $3, $4, $5) RETURNING *`, [title, dueDate, priority, project_id, req.user.id]);
        }
        res.status(201).json({success: true, data: newTask.rows});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Update a task
router.patch('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({success: false, message: 'Invalid task'});
            return;
        }
        const task = await Tasks.findOne({
            where: {
                id: id,
                users_id: req.user.id,
            }
        });
        if (!task) {
            res.status(404).json({success: false, message: 'Task not found'});
            return;
        }
        const updatedParts = {...req.body};
        delete updatedParts.created_at;
        delete updatedParts.updated_at;
        delete updatedParts.users_id;
        delete updatedParts.project_id;

        const [taskCount] = await Tasks.update(req.body, {
            where: {
                id: id,
                users_id: req.user.id,
            },
        });

        if (taskCount === 0) {
            res.status(404).json({success: false, message: 'Access denied or task was not found'});
            return;
        }

        const updatedTask = await Tasks.findOne({
            where: {
                id: id,
                users_id: req.user.id,
            },
        });

        res.status(200).json({success: true, data: updatedTask});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Delete a task in a project
router.delete('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const {id} = req.params;
        if (!id) {
            res.status(400).json({success: false, message: 'Invalid task'});
            return;
        }   
        const task = await Tasks.destroy({
            where: {
                id: id,
                users_id: req.user.id,
            },
        });
        return res.status(201).json({success: true, message: 'Deleted successfully'}); 
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Get a specific task
router.get('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({success: false, message: 'Invalid task'});
            return;
        }
        const task = await Tasks.findOne({
            where: {
                id: id,
                users_id: req.user.id,
            },
        });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found or access denied' });
            return;
        }
        res.status(200).json({success: true, data: task});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});


module.exports = router;
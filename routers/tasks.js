const express = require('express');
const router = express.Router();
const isUserAuthenticated = require('./isUserAuthenticated');
const validattor = require('validator');
const { Tasks, Projects } = require('../models');
const { Op } = require('sequelize');

// Get all tasks in a project  
router.get('/project/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
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
        if (!title || !due_date || !priority || priority === undefined || !project_id) {
            res.status(400).json({success: false, message: 'Missing required inputs'});
            return;
        } 
        if (!validattor.isInt(String(priority), { min: 1, max: 3})) {
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
        const projectResults = await Projects.findOne({
            where: {
                id: project_id,
                user_id: req.user.id,
            },
        });
        if (!projectResults) {
            res.status(404).json({success: false, message: 'Project was not found'});
            return;
        }
        // if task already exists in that project
        const taskResults = await Tasks.findOne({
           where: {
                title,
                project_id,
                users_id: req.user.id,
            }, 
        }); 
        if (taskResults) {
            res.status(400).json({success: false, message: 'Task already exists'});
            return;
        }
        // Query and insert into DB
        let newTask;
        if (description) {
            newTask = await Tasks.create({
                title,
                description,
                due_date,
                priority,
                project_id,
                users_id: req.user.id,
            });
        } else {
            newTask = await Tasks.create({
                title,
                due_date,
                priority,
                project_id,
                users_id: req.user.id,
            });
        }
        res.status(201).json({success: true, data: newTask});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Update a task
router.patch('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
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
            res.status(404).json({success: false, message: 'Access denied'});
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
        if (!id || isNaN(id)) {
            res.status(400).json({success: false, message: 'Invalid task'});
            return;
        }
        const taskExists = await Tasks.findOne({
            where: {
                id: id,
                users_id: req.user.id,
            },
        });
        if (!taskExists) {
            res.status(404).json({success: false, message: 'Task not found'});
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
        if (!id || isNaN(id)) {
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
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        res.status(200).json({success: true, data: task});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Search for a task
router.get('/task/search', isUserAuthenticated, async (req, res) => {
 try {
    const { task } = req.query;
    if (!task) {
        res.status(400).json({success: false, message: 'Missing search query'});
        return;
    }
    const tasks = await Tasks.findAll({
        where: {
            title: {
                [Op.like]: '%' + task + '%',    
            },
            users_id: req.user.id,
        },
    });
    res.status(200).json({success: true, data: tasks});
 } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: 'Server error'});
 }
});
module.exports = router;
const express = require('express');
const router = express.Router();
const isUserAuthenticated = require('./isUserAuthenticated');
const { Projects } = require('../models');
const { Op } = require('sequelize');

// Get all projects for the request user
router.get('/', isUserAuthenticated, async (req, res) => {
    try { 
        const projects = await Projects.findAll({
            where: {
                user_id: req.user.id,
            },
        });
        res.status(200).json({success: true, data: projects});   
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
        const existingProject = await Projects.findOne({
            where: {
                name,
                user_id: req.user.id,
            },
        });
        if (existingProject) {
            res.status(400).json({success: false, message: 'Project already exists'});
            return;
        }
        // Else add the new project into DB
        const newProject = await Projects.create({
            name,
            description,
            user_id: req.user.id,
        });
        res.status(201).json({success: true, data: newProject});

    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Update a project
router.patch('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            res.status(400).json({success: false, message: 'Invalid project id'});
            return;
        }
        const project = await Projects.findOne({
            where: {
                id: id,
                user_id: req.user.id,
            },
        });

        if(!project) {
            res.status(404).json({success: false, message: 'Project not found'});
            return;
        } 
        
        const updatedParts = {...req.body};
        delete updatedParts.created_at;
        delete updatedParts.updated_at;
        delete updatedParts.user_id;

        const [projectCount] = await Projects.update(updatedParts, {
            where: {
                id: id,
                user_id: req.user.id,
            },
        });

        if (projectCount === 0) {
            res.status(400).json({success: false, message: 'Project not found or access denied'});
            return;
        }
        const updatedProject = await Projects.findOne({
            where: {
                id: id,
                user_id: req.user.id,
            },
        });
        res.status(200).json({success: true, data: updatedProject});      
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Delete a project
router.delete('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const {id} = req.params;
        if (!id || isNaN(id)) {
            res.status(400).json({success: false, message: 'Invalid project'});
            return;
        }
        const projectExists = await Projects.findOne({
            where: {
                id: id,
                user_id: req.user.id,
            },
        });
        if (!projectExists) {
            res.status(404).json({success: false, message: 'Project not found!'});
            return;
        }   
        const project = await Projects.destroy({
            where: {
                id: id,
                user_id: req.user.id,
            },
        });
        return res.status(201).json({success: true, message: 'Deleted successfully'}); 
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Get a specific project
router.get('/:id', isUserAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            res.status(400).json({success: false, message: 'Invalid project'});
            return;
        }
        const project = await Projects.findOne({
            where: {
                id: id,
                user_id: req.user.id,
            },
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.status(200).json({success: true, data: project});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Search for a project
router.get('/project/search', isUserAuthenticated, async (req, res) => {
    try {
       const { project } = req.query;
       if (!project) {
           res.status(400).json({success: false, message: 'Missing search query'});
           return;
       }
       const projects = await Projects.findAll({
           where: {
               name: {
                   [Op.like]: '%' + project + '%',    
               },
               user_id: req.user.id,
           },
       });
       res.status(200).json({success: true, data: projects});
    } catch (error) {
       console.log(error);
       res.status(500).json({success: false, message: 'Server error'});
    }
   });
   
module.exports = router;
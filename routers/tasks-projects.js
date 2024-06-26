const express = require('express');
const router = express.Router();
const validator = require('validator');
const pool = require('../connectDB');
const {Users} = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const PgSimple = require('connect-pg-simple')(session);
const initializePassport = require('../passportConfig');
const isUserAuthenticated = require('./isUserAuthenticated');
const projectsRouter = require('./projects');
const tasksRouter = require('./tasks');

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PgSimple({ pool: pool, tableName: 'session'}),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

initializePassport(passport);
router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(passport.initialize());
router.use(passport.session());


// Login using username and password
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.status(200).json({success: true, message: 'You are signed in'});
});

// Register
router.post('/register', async (req, res) => {
    try {
        const {first_name, last_name, username, password, password2, email} = req.body;
        // Validating inputs
        if (!first_name || !last_name || !username || !password || !password2 || !email) {
            res.status(400).json({success: false, message: 'Invalid inputs!'});
            return;
        } 
        // Checking whether or not passwords match
        if (password !== password2) {
            res.status(400).json({success: false, message: 'Passwords do not match'});
            return;
        }
        // Validating password length
        if (password.length < 6) {
            res.status(400).json({success: false, message: 'Password must be more than 6 characters'});
            return;
        }
        if (!validator.isEmail(email)) {
            res.status(400).json({success: false, message: 'Invalid email'});
            return;
        } 
        // Checking whether or not there is already a username in DB
        const user = await Users.findOne({
            where: {
                username,
            },
        })
        if (user) {
            res.status(400).json({success: false, message: `Error: ${username} is already taken`});
            return;
        }
        // Generating hash for the password
        const saltRounds = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Add the user to DB 
        const newUser = await Users.create({
            first_name,
            last_name,
            username,
            password: hashedPassword,
            email,
        })
        return res.status(201).json({success: true, data: newUser});
    } catch (error) {
        console.log('Sever error: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Log the user out if authenticated
router.get('/logout', isUserAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) {
        }
        res.status(200).json({success: true, message: 'Logged out'});
    });
});

router.use('/projects', projectsRouter);
router.use('/tasks', tasksRouter);


module.exports = router;
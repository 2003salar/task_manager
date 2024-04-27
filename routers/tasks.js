const express = require('express');
const router = express.Router();
const pool = require('../connectDB');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const PgSimple = require('connect-pg-simple')(session);
const initializePassport = require('../passportConfig');

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
        // Checking whether or not there is already a username in DB
        const results = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = results.rows[0];
        if (user) {
            res.status(400).json({success: false, message: `Error: ${username} is already taken`});
            return;
        }
        // Generating hash for the password
        const saltRounds = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Add the user to DB
        const newUser = await pool.query(`INSERT INTO users 
                        (first_name, last_name, username, password, email)
                        VALUES ($1, $2, $3, $4, $5) RETURNING username, email`, [first_name, last_name, username, hashedPassword, email]); 
        return res.status(201).json({success: true, data: newUser.rows});
    } catch (error) {
        console.log('Sever error: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('./connectDB');
const bcrypt = require('bcrypt');

const authenticateUser = async (username, password, done) => {
    try {
        const results = await pool.query('SELECT * FROM users WHERE username = $1', [username])
        if (results.rows.length > 0) {
            const user = results.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, {message: 'Incorrect password'});
            } 
            return done(null, user);
        }
        return done(null, false, {message: 'User not Found'});   
    } catch (error) {
        return done(error);
    } 
};

const initialize = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, authenticateUser))
};

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const results = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (results.rows.length > 0) {
            return done(null, results.rows[0]);
        } 
        return done(null, null);  
    } catch (error) {
        return done(error);
    }
});

module.exports = initialize;
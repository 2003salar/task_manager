// Check if the user is authenticated 
const isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({success: false, message: 'You are not authorized'}); 
};


module.exports = isUserAuthenticated;
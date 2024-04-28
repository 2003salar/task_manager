const express = require('express');
const app = express();

const taskRouter = require('./routers/tasks-projects');

app.use('/', taskRouter);

app.all('*', (req, res) => {
    res.status(404).json({success: false, message: 'Page not found'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});
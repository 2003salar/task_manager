const express = require('express');
const app = express();

const taskRouter = require('./routers/tasks');

app.use('/', taskRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});
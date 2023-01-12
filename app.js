const express = require('express');
const bodyParser = require('body-parser');

const app = express();

/* *** load routes *** */
const userRoutes = require('./routes/user/user');
const followRoutes = require('./routes/user/follow/follow');
const profileRoutes = require('./routes/user/profile/profile');
const serviceRoutes = require('./routes/publish-now/publish-service/service');
const projectRoutes = require('./routes/publish-now/publish-project/project');
const messageRoutes = require('./routes/user/message/message');

/* *** middleware *** */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* *** cors *** */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

/* *** routes *** */
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', profileRoutes);
app.use('/api', serviceRoutes);
app.use('/api', projectRoutes);
app.use('/api', messageRoutes);

/* *** export *** */
module.exports = app;
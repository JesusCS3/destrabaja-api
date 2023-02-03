
const mongoose = require('mongoose');
const app = require('./app');
const port = 3800;

const DB_URI = 'mongodb+srv://JesusCS:Desarrollo29Mongo@jcscluster.5hq4xqy.mongodb.net/destrabaja_db'
//const DB_URI = 'mongodb://127.0.0.1:27017/destrabaja_db';

// connection database
mongoose.connect(DB_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err) {
        console.log('connection failed: ' + err);
    }else{
        console.log('connection established with database');

        // create server
        app.listen(port, () => {
            console.log('Server running');
        });
    }
});

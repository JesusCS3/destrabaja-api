const mongoose = require('mongoose');
const app = require('./app');
const purchasedService = require('./models/purchased-service/purchased-service');
require('dotenv').config();
const port = process.env.PORT || 3800;

const DB_URI = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@jcscluster.5hq4xqy.mongodb.net/${process.env.DB_NAME}`;
//const DB_URI = 'mongodb://127.0.0.1:27017/destrabaja_db';

// connection database
mongoose.connect(DB_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err) {
        console.log('connection failed: ' + err);
    }else{
        console.log('******connection established with database******');
    }
});

// create server
 const server = app.listen(port, () => {
    console.log('*****Server running*****');
});

const io = require('socket.io')(server, {
    cors: {
          origin : true,
          credentials: true,
          methods: ['GET','POST']
  
      }
});

global.onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('Nuevo usuario: ' + socket.id);
    //console.log(socket);

    global.chatSocket = socket;
    socket.on('add-user', (userId) => {
        onlineUsers.set(userId, socket.id);

        console.log('******onlineusers*******');
        console.log(onlineUsers);
    });

    socket.on('send-msg', (data) => {
        console.log(data);
        const sendUserSocket = onlineUsers.get(data.receiver);

        console.log('******sendUserSocket*******');
        console.log(sendUserSocket);

        if (sendUserSocket) {
            socket.to(sendUserSocket).emit('msg-receive' , data.text);

            /*
            if(data.service && (data.project === null)){
                socket.to(data.service).emit('msg-receive' , data.text);
            }

            if(data.project && (data.service === null)){
                socket.to(data.project).emit('msg-receive' , data.text);
            }
            
            if(data.purchasedService){
                socket.to(data.purchasedService).emit('msg-receive' , data.text);
            }

            if(data.projectStarted){
                socket.to(data.projectStarted).emit('msg-receive' , data.text);
            } 
            */
        }
    });
});

/*
const io = require('socket.io')(server, {
    cors: {
          origin : true,
          credentials: true,
          methods: ['GET','POST']
  
      }
  });
*/
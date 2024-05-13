// const app = require('express')();
// const httpServer = require('http').createServer(app);
// const io = require('socket.io')(httpServer, {
//   cors: {origin : '*'}
// });

// const port = 3000;

// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('message', (message) => {
//     console.log(message);
//     io.emit('message', `${socket.id.substr(0, 2)}: ${message}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('a user disconnected!');
//   });
// });

// httpServer.listen(port, () => console.log(`listening on port ${port}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes=require('./routes/routes');
const {Server} = require('socket.io');

const http=require('http');
const app = express();
// const httpServer=http.createServer(app);
// const io=new Server(httpServer);
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: { origin: "*" },
    // credentials:true,
});
require('dotenv').config(); 
// io.origins('*:*');
let uRoomNo="";
const corsOptions={
    credentials:true,
    origin: 'https://tele-chat-77dg.onrender.com',
    // credentials:true,
    // methods: ["GET", "POST"],
}
app.use(cors(corsOptions));
// app.use(cors());
// app.use(cors({
//     credentials:true,
//     origin:['http://localhost:4200']
//   }));
//middlewares
app.use(cookieParser());
app.use(express.json());

io.on('connection',(socket)=>{
    console.log('A user connected');

    socket.on('joinRoom',(message)=>{
        let uRoomNo=message;
        console.log("received room no. on backend is: "+uRoomNo);
    
        // const socket=io.sockets.sockets[socket.id];
        socket.room="room-"+uRoomNo;
        socket.join("room-"+uRoomNo);
    });

    socket.on('sendMsg', (message) => {
        console.log("sendMsg event is going to be called: "+message.text);

        // io.to("room-"+uRoomNo).
        io.emit('sendMsgEvent',message.text);
    });
    socket.on('disconnect',()=>{
        console.log('A user disconnected');
    });
});



//routes
app.use('/api',routes);
const PORT = process.env.PORT || 5000;
const mongodb_uri = process.env.MONGODB_CONNECTION_STRING;

// mongoose.connect("mongodb://172.17.0.2:27017/telechat",{
// mongoose.connect("mongodb://127.0.0.1:27017/telechat",{
mongoose.connect(mongodb_uri,{
    useNewUrlParser:true
}).then(()=>{
    console.log("connected to database");
    httpServer.listen(PORT,()=>{
        console.log('Server is listening on port 5000');
    });
}).catch((error)=>{
    console.error('Error connecting to the database: ',error);
});




// //take last 3 digit from sender and receiver id and add them for unique room
// app.post('/api/joinRoom',(req,res)=>{
//     uRoomNo=req.body.roomNo;
//     console.log("received room no. on backend is: "+uRoomNo);

//     const socket=io.sockets.sockets[socket.id];
//     socket.room="room-"+uRoomNo;
//     socket.join("room-"+uRoomNo);

//     // io.sockets.in("room-"+uRoomNo).emit('connectedRoom',"You are connected to room no. "+uRoomNo);

//     res.status(200).json({message:'Joined room successfully'});
// });





















// mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
// // 
// mongoose.connect("mongodb://localhost:27017/telechat",{

const bodyParser = require("body-parser")
const userRoutes = require("./routes/user")
const errRoutes = require("./routes/error")
const homeRoutes = require('./routes/base')
const chatRoutes = require('./routes/chat');
const browsingRoutes = require('./routes/browsing')
const cookieParser = require('cookie-parser')
const authRoutes = require("./routes/auth")
const pss = require('./util/passport.js')
const passport = require('passport')
const cors = require("cors")
const express = require('express')
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }}
    );

    io.on('connection', (socket) => {
        console.log('we have a new connection');
    
        socket.on('disconnect', () => {
            console.log('User had left')
        })
    })

// const server = http.createServer(app);
app.use(express.json());
var corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(cors(corsOptions));
app.use(cookieParser());

//bodyParser
//extended: false
app.use(bodyParser.urlencoded({extended: true}));

// Images ***************************************************
// need help of package path
const path = require('path');
// static folder to thing like image ...
app.use(express.static(path.join(__dirname, 'public/upload')));
// console.log(express.static(path.join(__dirname, 'public'))
//**********************************************************

// parse application/json
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(authRoutes)
app.use(homeRoutes)
app.use(browsingRoutes)
app.use(userRoutes)
app.use(errRoutes)
app.use('/chat', chatRoutes);

// const io = socketio(server)


// server.listen(3001)
http.listen(3001, () => {
    console.log('listening on *:3001');
  }); 
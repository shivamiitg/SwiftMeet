const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
var cors = require('cors');
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.use("/peerjs", peerServer);
const { v4: uuidV4 } = require('uuid')
require('dotenv').config()
const cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'bla bla bla' 
  }));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const nodemailer = require("nodemailer");
const keys = require('./config/keys')

const passportSetup = require('./config/passport-setup')
const router = require("express").Router();
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


var username = "initialUsername";
var USER_ID = "initialUserId"
var userMap = new Map();

const authCheck = (req, res, next) => {
    // console.log(username);
    if(username === "initialUsername"){
        res.render('404');
    } else {
        next();
    }
    // next();
};

app.get('/home', authCheck, (req,res)=>{
    res.render('home', {user: username, userId: USER_ID, userList: userMap});
})

app.get("/room", authCheck, function(req, res){
    res.redirect(`/${uuidV4()}`);
    // res.redirect("/uuidV4()");
});

var email;
var url = require('url');

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
}

// var link;
app.get('/', (req,res)=>{
    link = fullUrl(req);
    console.log(link);
    res.render('login');
    // res.send("Hi");
})

app.get('/auth/login', (req,res)=>{
    res.render('login');
})

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile'],
    // prompt: 'select_account'
}));


app.get('/auth/logout', (req,res,next)=>{
    // req.session.destroy();
    console.log("hue");
    req.logout(function(err) {
        
        if (err) { return next(err); }
        res.redirect('/');
    });
    
})
app.get('/auth/logout', (req,res,next)=>{
    // req.session.destroy();
    console.log("hue");
    req.logout(function(err) {
        
        if (err) { return next(err); }
        res.redirect('/');
    });
    console.log(username);
})

app.get('/auth/google/redirect', passport.authenticate('google'), (req,res)=>{
    username = req.user.username;
    USER_ID = `${uuidV4()}`;
    userMap.set(USER_ID, username);
    console.log(`hue ${userMap.get(USER_ID)}`);
    res.redirect('/home');
})


var ROOM_ID;
app.get("/:room", authCheck,  function(req, res){
    var temp =  req.params.room;
    if(temp.length > 12) ROOM_ID = req.params.room;
    // console.log(ROOM_ID);
    res.render("room", {roomId: req.params.room, user: req.user.username});
});



app.post('/room', (req, res) => {
    console.log("hue");
    console.log(req.body);
    email = req.body.email;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: keys.credentials.email,
            pass: keys.credentials.password
        }
    })

    const mailOptions = {
        from: 'dezylsolanki3@gmail.com',
        to: email,
        subject: 'Meet reminder!',
        text: `Your meet with ${username} is about to start. The Room ID is ${link}${ROOM_ID}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log(email);
            console.log(error);
        }
        else{
            console.log('success');
            alert('Email sent!');
        }
    })
})


io.sockets.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => { //roomId, userId
        socket.join(roomId);
        // socket.to(roomId).broadcast.emit("user-connected");
        socket.broadcast.to(roomId).emit("user-connected", userId);
        // console.log("room joined");
        socket.on('message', (message, name) => {
            io.to(roomId).emit('createMessage', message, name)
        }); 
    });
});


app.use(express.json());

const mongoose = require('mongoose');

const MONGO_PROD_URI = keys.mongodb.dbURL;
mongoose 
 .connect(MONGO_PROD_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
           })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

 
const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log("server started!");
});


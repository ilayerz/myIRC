'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/chat')
.then(() =>  console.log('connection succesful'))
.catch((err) => console.error(err));
var createError = require('http-errors');
var express = require('express');
var rebound = require('rebound');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

server.listen(3010);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var curChannel = 'general';
var people = {};
var channelList = {};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', function(socket){
  var newuser;
  var currentRoom = "general";
  socket.on('new user', function(pseudo){
    newuser = pseudo;
    people[pseudo] = socket.id;
  });
  socket.join('general');
  //io.emit('chat message', 'a user connected');
  console.log('a user connected');
  console.log(people);
  console.log(io.sockets.adapter.rooms);
  
  socket.on('disconnect', function(){
    var msg = {content : newuser + " s'est déconnecté", channel: 'general'}
    io.emit('chat message', msg);
    console.log('user disconnected');
    delete people[newuser];
    console.log(people);
  });
  socket.on('chat message', function(msg){
    io.to(msg.channel).emit('chat message', msg);
    console.log('message: ' + msg.content);
  });
  
  socket.on('join channel', function(channel){
    socket.join(channel);
    //channel.user = {};
    //channel.user.push(newuser);
    var msg = {content: newuser + " a join le channel " + channel, channel: channel};
    io.to(channel).emit('chat message',msg);
  });
  
  socket.on('leave channel', function(channel){
    socket.leave(channel);
    var msg = {content: newuser + " a quitté le channel " + channel, channel: channel}
    io.to(channel).emit('chat message',msg);
  });
  socket.on('message privé', function(MP){
    io.to(people[MP.content[1]]).emit('message privé', MP);
    io.to(people[MP.by]).emit('message privé', MP);
  });
  
  socket.on('active channel', function(channel){
    curChannel = channel;
  });
  socket.on('change name room', function(room){
    var msg = {content : "L'admin a changé le nom du channel "+ room.actualroom +" en: " + room.nextroom, channel: room}
    socket.room = room.nextroom;
    socket.to(room.nextroom).emit('chat message', msg);
    socket.emit('change', room);
  });
  socket.on('delete room', function(channel){
    io.of('/').in(channel).clients(function(error, clients) {
      if (clients.length > 0) {
        clients.forEach(function (socket_id) {
          io.sockets.sockets[socket_id].leave(channel);
          io.sockets.sockets[socket_id].emit('leave',channel);
        });
        var msg = {content: "L'admin a supprimé le channel "+ channel, channel:'general'}
        socket.broadcast.emit('chat message',msg);
      }
    });
  });
  
  socket.on('users list', function(content){
    var msg = {content: "Liste des utilisateurs: "+ Object.keys(people), channel: content.channel};
    io.to(people[content.pseudo]).emit('chat message', msg);
  });
  
  socket.on('channel list', function(content){
    //console.log(io.sockets.adapter.rooms);
    var room_list = {};
    var rooms = io.sockets.adapter.rooms;
    
    for (var room in rooms){
      if (!rooms[room].hasOwnProperty(room)) {
        //console.log(rooms[room]);
        room_list[room] = Object.keys(rooms[room]).length;
      }
    }
    console.log(Object.keys(room_list));
    var msg = {content: "Liste des channels: " + Object.keys(room_list), channel: content.channel};
    io.to(people[content.pseudo]).emit('chat message', msg);
    
    //var msg = "Liste des channels: " + Object.keys(room_list);
    //io.to(people[content.pseudo]).emit('chat message', msg);
  })
  
});

var User = require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




module.exports = app;

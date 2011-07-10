var express= require('express')
  , app    = express.createServer()    
  , sio    = require('socket.io');

// configure express server
app.configure(function(){
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});  

// root, er, route
app.get('/', function(req, res){
  // maybe do something here?
});

// set http server listening on a nice port
app.listen(8080, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

// Socket.IO server
var io         = sio.listen(app)
  , usernames  = {};

io.sockets.on('connection', function (socket) {
  
  // registration of a new user
  socket.on('username', function (user) {
    
    // set username on socket object & add username to user hash
    socket.username = user; 
    usernames[user] = 'connected'

    // send to all except connecting socket
    socket.broadcast.emit('announcement', user + ' connected'); 
    
    // send usernames to all connected sockets
    io.sockets.emit('usernames', usernames);

    // let connecting browser know we're ready
    socket.emit('ready');
  });

  // recieve Location data and broadcast to all except sending socket
  socket.on('update_location', function (data) {
    socket.broadcast.emit('location_data', socket.username, data);
  });


  socket.on('disconnect', function () {
    if (!socket.username) return;

    // clean up when a client disconnects
    delete usernames[socket.username];

    // notify clients 
    socket.broadcast.emit('announcement', socket.username + ' disconnected');
    
    // resend usernames to remaining sockets    
    socket.broadcast.emit('usernames', usernames);
  });
});

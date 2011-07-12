/*
* Websockets geochat server
* `npm install` to install dependencies
*/
var sio    = require('socket.io')
  , express= require('express')
  , app    = express.createServer();
  
  
/*
* Express based web server to serve static assets 
* and to be starting point for websockets
* 
*/

// configure express server
app.configure(function(){
  app.use(express.logger());  // enables logging to stdout
  app.use(express.static(__dirname + '/public')); // configures static file serving from /public
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});  

// root, er, route
app.get('/', function(req, res){
  // maybe do something here - could be an API endpoint for comms with Rails?
});

// set http server listening on a nice port
app.listen(8080, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});





/* 
*
* Socket.IO server for managing realtime comms
*
*/

var io         = sio.listen(app)
  , usernames  = {}; // we store all the connected usernames here

// socket.io works by registering callbacks on events. 
// There are standard events, like 'connection', 
// but you can make any event you want and register callbacks against them
io.sockets.on('connection', function (socket) {

  // on the event of registration of a new user...
  socket.on('username', function (user) {
    
    // set username variable on the socket object & store the username
    // socket.io maintains sockets transparently for you. 
    // You can think of them as permanent connections.
    socket.username = user; 
    usernames[user] = 'connected'

    // send an event to all connected sockets except connecting socket with a message
    socket.broadcast.emit('announcement', user + ' connected'); 
    
    // send an event to all connected sockets with the updated usernames object
    io.sockets.emit('usernames', usernames);

    // send an event to the connecting socket to let it know we're ready
    socket.emit('ready');
  });


  // on the event of recieve location data from a user, 
  // send an event to all connected sockets except the sending socket 
  // with the users location data and username
  socket.on('update_location', function (data) {
    socket.broadcast.emit('location_data', socket.username, data);
  });


  // When a user disconnects, the socket emits a disconnect event 
  // you can use this to do teardown/clenup.
  socket.on('disconnect', function () {
    if (!socket.username) return;

    // remove username from stored list when client disconnects
    delete usernames[socket.username];

    // send an event to all connected clients about disconnect 
    socket.broadcast.emit('announcement', socket.username + ' disconnected');
    
    // send an event to all connected clients with new userlist    
    socket.broadcast.emit('usernames', usernames);
  });
});

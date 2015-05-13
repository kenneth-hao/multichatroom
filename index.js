var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.get('/', function(req, res) {
  res.send('<h1>Welcome Realtime Server</h1>')
})

var onlineUsers = {}
var onlineCount = 0

io.on('connection', function(socket) {
  console.log('a user connected')

  socket.on('login', function(obj) {
    socket.name = obj.userid

    if (!onlineUsers.hasOwnProperty(obj.userid)) {
      onlineUsers[obj.userid] = obj.username
      onlineCount++
    }

    io.emit('login', {
      onlineUsers: onlineUsers, 
      onlineCount: onlineCount, 
      user:obj
    })

    console.log(obj.username + ' jion in chatroom.')
  })

  socket.on('disconnect', function() {
    if (onlineUsers.hasOwnProperty(socket.name)) {
      var obj = {userid: socket.name, username: onlineUsers[socket.name]};

      delete onlineUsers[socket.name]
      onlineCount--

      io.emit('logout', {onlineUsers: onlineUsers, onlineCount:onlineCount, user:obj})
      console.log(obj.username + ' exit chatroom.')
    }
  })

  socket.on('message', function(obj) {
    io.emit('message', obj)
    console.log(obj.username + ' say: ' + obj.content)
  })
})

http.listen(3000, function() {
  console.log('listening on *: 3000')
})

// npm packages requires
const express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
// local requires
const GameServer = require('./gameServer.js')

const game = new GameServer()
// rooting to public folder
app.use(express.static('public'))

// socket connection handling
io.on('connection', function (socket) {
  console.log(`${socket.id} connected`)
  game.onPlayerConnected(socket.id)

  // We prompt for the usernmae on the client side
  socket.emit('player:getusername')

  // ping calculus
  socket.on('game:ping', () => {
    socket.emit('game:pong', Date.now())
  })

  socket.on('player:setusername', (username) => {
    game.setPlayerUsername(socket.id, username)
  })
})

let past = Date.now()
setInterval(function () {
  // delta time calculus
  const now = Date.now()
  const delta = now - past
  past = now
  // execute the logic loop
  game.logic(delta)
}, 20)

// Listen on environment variable PORT
// or 3000 by default
const port = process.env.PORT || 3000

http.listen(port, function () {
  console.log(`listening on port ${port}`)
})

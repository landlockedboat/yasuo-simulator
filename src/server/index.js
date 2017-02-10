// npm packages requires
const express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
// local requires
const GameServer = require('./gameServer.js')
const constants = require('../common/constants.js')
const utils = require('../common/utils.js')

const game = new GameServer()
// rooting to public folder
app.use(express.static('public'))

// socket connection handling
io.on('connection', function (socket) {
  console.log(`${socket.id} connected`)

  // Initialise a new player on a random position
  let randX = Math.random() * constants.MAP_BOUNDARIES.x
  let randY = Math.random() * constants.MAP_BOUNDARIES.y

  game.onPlayerConnected(socket.id, randX, randY)

  // We prompt for the usernmae on the client side
  socket.emit('player:getusername')

  // ping calculus
  socket.on('game:ping', () => {
    socket.emit('game:pong', Date.now())
  })

  socket.on('player:setusername', (username) => {
    game.players[socket.id].username = username
    // Once the username is set, the game can begin
    socket.emit('game:init', game.players, socket.id)
    socket.broadcast.emit('game.players:update', game.players)
  })

  socket.on('player:move', (inputs) => {
    game.onPlayerMoved(socket.id, inputs)
    io.sockets.emit('player:update', game.players[socket.id])
  })

  socket.on('disconnect', () => {
    game.onPlayerDisconnected(socket.id)
    socket.broadcast.emit('game.players:update', game.players)
  })

  socket.on('player:attack', (attackInputs, mousePos) => {
    const playerId = socket.id
    const player = game.players[playerId]
    if (player.isAirbone || player.isDead) {
      return
    }
    if (attackInputs.Q_KEY) {
      if (player.reloadingTime <= 0) {
        player.reloadingTime = constants.RELOADING_TIME
        game.onCreateTornado(playerId, player.pos, mousePos)
        io.sockets.emit('game.tornados:update', game.tornados)
      }
    } else if (attackInputs.R_KEY) {
      for (let player2Id in game.players) {
        const player2 = game.players[player2Id]
        if (player2.isAirbone) {
          player.pos = Object.assign({}, player2.pos)
          player2.isDead = true
          game.players[player2Id] = player2
          io.sockets.emit('player:update', game.players[player2Id])
          player.score += 1
        }
      }
    }
    game.players[playerId] = player
    io.sockets.emit('player:update', game.players[socket.id])
  })
})

function tornadoLogic (delta) {
  for (let playerId in game.players) {
    var playPos = game.players[playerId].pos
    // We use the squared distance because it's cheaper
    var sumRadSq = Math.pow(constants.TORNADO_RADIUS + constants.PLAYER_RADIUS, 2)
    var airbone = false
    game.tornados.forEach((tornado) => {
      var torPos = tornado.pos
      if (utils.sqDist(playPos, torPos) < sumRadSq) {
        // We don't want to collide with ourselves, do we?
        if (tornado.prop !== playerId) {
          airbone = true
          game.players[playerId].airboneTime = constants.AIRBONE_TIME
          game.players[playerId].isAirbone = true
        }
      }
    })
    if (airbone) {
      // A player went airbone!
      game.tornados = []
      io.sockets.emit('game.tornados:update', game.tornados)
      io.sockets.emit('player:update', game.players[playerId])
    }
  }
}

let past = Date.now()
setInterval(function () {
  // delta time calculus
  const now = Date.now()
  const delta = now - past
  past = now
  // execute the logic loop
  game.logic(delta)
  // Becuase this last bit uses sockets intensively,
  // we execute it otside the server class entirely
  tornadoLogic(delta)
}, 20)

// Listen on environment variable PORT
// or 3000 by default
const port = process.env.PORT || 3000

http.listen(port, function () {
  console.log(`listening on port ${port}`)
})

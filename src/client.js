// for standard
/* globals requestAnimationFrame, io, prompt */
const GameClient = require('./gameClient.js')
const GameRenderer = require('./gameRenderer.js')

// socket.io
const socket = io()
// we initialise the game
var game = new GameClient()
// init the renderer
var renderer = new GameRenderer()

var gameStarted = false

// ping calculus
let lastPingTimestamp
// how many ms the server is ahead from us
let clockDiff = 0
let ping = Infinity

// ping handshaking
function startPingHandshake () {
  lastPingTimestamp = Date.now()
  socket.emit('game:ping')
}
setInterval(startPingHandshake, 250)

// socket handling
socket.on('connect', function () {
  console.log('connected to the server')

  socket.on('game:pong', (serverNow) => {
    ping = (Date.now() - lastPingTimestamp) / 2
    clockDiff = (serverNow + ping) - Date.now()
    // console.log(clockDiff)
  })

  socket.on('player:getusername', () => {
    const username = prompt('How do you want to be called as, oh brave warrior?')
    socket.emit('player:setusername', username)
  })

  socket.on('game:init', (players) => {
    console.log('game started')
    game.players = players
    gameStarted = true
  })

  socket.on('game.players:update', (players) => {
    game.players = players
  })
})

// initialise last registered timestamp
let past = Date.now()
// main game loop
function gameloop () {
  requestAnimationFrame(gameloop)
  if (!gameStarted) { return }
  const now = Date.now()
  const delta = now - past
  past = now
  // once we have delta calculated we execute our logic
  game.logic(delta)
  // packaging info to be sent to the renderer
  game.ping = ping
  game.clockDiff = clockDiff
  // render the game
  renderer.render(delta, game)
}

requestAnimationFrame(gameloop)

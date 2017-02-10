// for standard
/* globals requestAnimationFrame, io, prompt, Audio, alert */
// npm requires
const kbd = require('@dasilvacontin/keyboard')
// we need to add a couple keys to @dasilvacontin's keyboard package!
kbd.Q_KEY = 81
kbd.R_KEY = 82
kbd.W_KEY = 87
kbd.A_KEY = 65
kbd.S_KEY = 83
kbd.D_KEY = 68

const deepEqual = require('deep-equal')
// local requires
const GameClient = require('./gameClient.js')
const GameRenderer = require('./gameRenderer.js')
const engine = require('./engine.js')

// socket.io
const socket = io()
// we initialise the game
var game = new GameClient()
// init the renderer
var renderer = new GameRenderer()
// and add a reference to the on onClick callback
// for when we click on the canvas
renderer.registerOnClickCallback(onClick)

var gameStarted = false
let myPlayerId = null
let myUsername
const myInputs = new engine.Inputs()
const myAttackInputs = new engine.AttackInputs()

// sounds, i am too tired to make a class for this
// FIXME: make a class for this
const soundsAmmount = 10

function createSoundCollection (soundPath) {
  var ret = []
  for (let i = 0; i < soundsAmmount; ++i) {
    ret[i] = new Audio(soundPath)
  }
  return ret
}

function playSound (soundCollection) {
  for (let i = 0; i < soundsAmmount; ++i) {
    const sound = soundCollection[i]
    if (sound.duration > 0 && !sound.paused) {
      // The sound is playing
      continue
    } else {
      sound.play()
      break
    }
  }
}

const hasagiSounds = createSoundCollection('sounds/hasagi.mp3')
const ultiSounds = createSoundCollection('sounds/ulti.mp3')
const dangerSounds = createSoundCollection('sounds/danger.wav')

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
  })

  socket.on('player:getusername', () => {
    if (!myUsername) {
      myUsername = prompt('How do you want to be called as, oh brave warrior?', 'yasuo')
    }
    socket.emit('player:setusername', myUsername)
  })

  socket.on('game:init', (players, playerId) => {
    console.log('game started')
    game.players = players
    myPlayerId = playerId
    // for rendering the 'press R' text
    game.myPlayerId = playerId
    gameStarted = true
  })

  socket.on('game.tornados:update', (tornados) => {
    game.tornados = tornados
    if (tornados.length <= 0) {
      playSound(dangerSounds)
    } else {
      playSound(hasagiSounds)
    }
  })

  socket.on('player:update', (player) => {
    if (player.isDead) {
      playSound(ultiSounds)
      if (player.id === myPlayerId) {
        alert('You are dead. Press F5 to respawn.')
      }
    }
    game.players[player.id] = player
  })

  socket.on('game.players:update', (players) => {
    game.players = players
  })
})

function onClick (event) {
  // we are not using this for the time being
  // socket.emit('player:click', renderer.mousePos)
}

function updateInputs () {
  const oldInputs = Object.assign({}, myInputs)

  // using @dasilvacontin's keyboard package, we can update the
  // inputs of our player based on the keyboard's state
  for (let key in myInputs) {
    myInputs[key] = kbd.isKeyDown(kbd[key])
  }

  if (!deepEqual(myInputs, oldInputs)) {
    socket.emit('player:move', myInputs)

    // update our local player' inputs aproximately when the server
    // takes them into account
    const frozenInputs = Object.assign({}, myInputs)
    setTimeout(function () {
      const myPlayer = game.players[myPlayerId]
      myPlayer.inputs = frozenInputs
    }, ping)
  }

  const oldAttackinputs = Object.assign({}, myAttackInputs)

  for (let key in myAttackInputs) {
    myAttackInputs[key] = kbd.isKeyDown(kbd[key])
  }
  if (!deepEqual(myAttackInputs, oldAttackinputs)) {
    socket.emit('player:attack', myAttackInputs, renderer.mousePos)
  }
}

// initialise last registered timestamp
let past = Date.now()
// main game loop
function gameloop () {
  requestAnimationFrame(gameloop)
  if (!gameStarted) { return }
  const now = Date.now()
  const delta = now - past
  past = now
  // once we have delta calculated we update our inputs
  updateInputs()
  // and we run our game logic
  game.logic(delta)
  // packaging info to be sent to the renderer
  game.ping = ping
  game.clockDiff = clockDiff
  // render the game
  renderer.render(delta, game)
}

requestAnimationFrame(gameloop)

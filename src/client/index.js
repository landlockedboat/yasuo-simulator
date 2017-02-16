// for standard
/* globals requestAnimationFrame, io, location */
// npm requires
const kbd = require('@dasilvacontin/keyboard')
const deepEqual = require('deep-equal')
const swal = require('sweetalert')
// local requires
const GameClient = require('./gameClient.js')
const GameRenderer = require('./gameRenderer.js')
const GameAudio = require('./gameAudio.js')
const engine = require('../common/engine.js')

// we need to add a couple keys to @dasilvacontin's keyboard package!
kbd.Q_KEY = 81
kbd.R_KEY = 82
kbd.W_KEY = 87
kbd.A_KEY = 65
kbd.S_KEY = 83
kbd.D_KEY = 68
// socket.io
const socket = io()
// we initialise the game
var game = new GameClient()
// init the renderer
var renderer = new GameRenderer()
// and add a reference to the on onClick callback
// for when we click on the canvas
renderer.registerOnClickCallback(onClick)
// now, the audio
const sounds = {
  hasagi: 'sounds/hasagi.mp3',
  ulti: 'sounds/ulti.mp3',
  danger: 'sounds/danger.wav'
}
// we can access all sounds via their name later.
var audio = new GameAudio(sounds, 10)

let myUsername
const myInputs = new engine.Inputs()
const myAttackInputs = new engine.AttackInputs()

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
    if (myUsername) {
      // If our username is already set, we bail
      return
    }
    swal({
      title: 'Introduce your name!',
      text: 'How do you want to be called as, oh brave warrior?',
      type: 'input',
      closeOnConfirm: true,
      showCancelButton: false,
      animation: 'slide-from-top'
    }, function (inputValue) {
      myUsername = "yasuo's apprentice, " + inputValue.substring(0, 20)
      socket.emit('player:setusername', myUsername)
    })
  })

  socket.on('game:init', (players, playerId) => {
    console.log('game started')
    game.onGameInit(players, playerId)
  })

  socket.on('game.tornados:update', (tornados) => {
    game.tornados = tornados
    if (tornados.length <= 0) {
      audio.play('danger')
    } else {
      audio.play('hasagi')
    }
  })

  socket.on('player:update', (player) => {
    if (player.isDead && game.isRunning) {
      audio.play('ulti')
      if (player.id === game.myPlayerId && game.isRunning) {
        swal({
          title: 'You are dead!',
          text: `Press OK to respawn...`,
          type: 'info',
          closeOnConfirm: true,
          showConfirmButton: true,
          disableButtonsOnConfirm: true
        }, function () {
          location.reload()
        })
      }
    }
    game.players[player.id] = player
  })

  socket.on('game.players:update', (players) => {
    game.players = players
  })

  socket.on('game.players:new', (player) => {
    game.onNewPlayer(player)
  })
})

function onClick (event) {
  // Binding Q to click
  myAttackInputs.Q_KEY = true
  socket.emit('player:attack', myAttackInputs, renderer.mousePos)
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
      const myPlayer = game.getMyPlayer()
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

  // Check for debug mode on or off
  if (kbd.isKeyDown(48)) {
    console.log('in deb')
    game.isInDebugMode = true
  } else if (kbd.isKeyDown(49)) {
    console.log('out deb')
    game.isInDebugMode = false
  }
}

// initialise last registered timestamp
let past = Date.now()
// main game loop
function gameloop () {
  requestAnimationFrame(gameloop)
  if (!game.isRunning) { return }
  const now = Date.now()
  const delta = (now - past) / 1000
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

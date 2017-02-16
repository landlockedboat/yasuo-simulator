var deepcopy = require('deepcopy')
var Game = require('../common/game.js')
var engine = require('../common/engine.js')

module.exports =
  class GameClient extends Game {
    constructor () {
      super()
      // This players will be the ones being rendered
      this.virtualPlayers = {}
      this.isInDebugMode = false
      // Virtual players variables
      this.virtualPlayerSpeed = 300
      this.virtualPlayerCloseEnough = 5
    }

    onGameInit (players, myPlayerId) {
      // At first, the virtual players have the same position
      // as the real ones
      this.players = players
      // We don't want out virtual players to behave exactly like our players!
      this.virtualPlayers = deepcopy(players)
      // Create vector objects for the virtual players
      for (let vPlayId in this.virtualPlayers) {
        let vec = new engine.Vector()
        vec.clone(this.virtualPlayers[vPlayId].pos)
        this.virtualPlayers[vPlayId].pos = vec
      }
      this.myPlayerId = myPlayerId
      this.isRunning = true
    }

    onNewPlayer (player) {
      if (this.players[player.id]) {
        throw new Error(`Player ${player.id} already exists!`)
      }
      this.players[player.id] = player
      this.virtualPlayers[player.id] = deepcopy(player)
      let vec = new engine.Vector()
      vec.clone(player.pos)
      this.virtualPlayers[player.id].pos = vec
    }

    getMyPlayer () {
      return this.players[this.myPlayerId]
    }

    moveVirtualPlayer (delta, playerId) {
      let playerPos = this.players[playerId].pos
      // let playerVel = this.players[playerId].velocity
      this.virtualPlayers[playerId].pos.moveTo(
        playerPos,
        this.virtualPlayerSpeed * delta,
        this.virtualPlayerCloseEnough)
    }

    logic (delta) {
      super.logic(delta, this.moveVirtualPlayer.bind(this))
    }
  }

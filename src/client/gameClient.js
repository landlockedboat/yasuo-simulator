var deepcopy = require('deepcopy')
var Game = require('../common/game.js')
var engine = require('../common/engine.js')
const constants = require('../common/constants.js')

module.exports =
  class GameClient extends Game {
    constructor () {
      super()
      // This players will be the ones being rendered
      this.virtualPlayers = {}
    }

    onGameInit (players, myPlayerId) {
      // At first, the virtual players have the same position
      // as the real ones
      this.players = players
      // We don't want out virtual players to behave exactly like our players!
      this.virtualPlayers = deepcopy(players)
      this.myPlayerId = myPlayerId
      this.isRunning = true
    }

    onNewPlayer (player) {
      if (this.players[player.id]) {
        throw new Error(`Player ${player.id} already exists!`)
      }
      this.players[player.id] = player
      this.virtualPlayers[player.id] = deepcopy(player)
    }

    getMyPlayer () {
      return this.players[this.myPlayerId]
    }

    moveVirtualPlayer (delta, playerId) {
      let playerPos = this.players[playerId].pos
      // let playerVel = this.players[playerId].velocity
      let vPlayerPos = this.virtualPlayers[playerId].pos
      vPlayerPos = engine.vectorMoveTo(vPlayerPos, playerPos,
        constants.MAX_SPEED * delta, 5)
      this.virtualPlayers[playerId].pos = vPlayerPos
    }

    logic (delta) {
      super.logic(delta, this.moveVirtualPlayer.bind(this))
    }
  }

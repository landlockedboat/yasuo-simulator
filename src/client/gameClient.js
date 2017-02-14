var Game = require('../common/game.js')

module.exports =
  class GameClient extends Game {
    constructor () {
      super()
      // This players will be the ones being rendered
      this.virtualPlayers = {}
    }

    onGameInit (players, myPlayerId) {
      this.players = players
      this.myPlayerId = myPlayerId
      this.isRunning = true
    }

    getMyPlayer () {
      return this.players[this.myPlayerId]
    }

    logic (delta) {
      super.logic(delta)
    }
  }

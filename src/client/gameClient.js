var Game = require('../common/game.js')

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
      this.players = this.virtualPlayers = players
      this.myPlayerId = myPlayerId
      this.isRunning = true
    }

    onNewPlayer(player){
      if(this.players[player.id]){
        throw new Error(`Player ${player.id} already exists!`)
      }
      this.players[player.id] = player
    }

    getMyPlayer () {
      return this.players[this.myPlayerId]
    }

    logic (delta) {
      super.logic(delta)
    }
  }

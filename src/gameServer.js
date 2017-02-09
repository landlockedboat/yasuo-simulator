const engine = require('./engine.js')

module.exports =
  class GameServer {
    constructor () {
      this.players = {}
    }

    logic (delta) {

    }

    onPlayerConnected (playerId, x, y) {
      const player = new engine.PlayerObject(
        playerId,
        x,
        y
      )

      this.players[playerId] = player
    }
  }

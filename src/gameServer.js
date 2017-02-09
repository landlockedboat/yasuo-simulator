const engine = require('./engine.js')

module.exports =
  class GameServer {
    constructor () {
      this.players = {}
    }

    logic (delta) {

    }

    onPlayerConnected (playerId) {
      const player = new engine.PlayerObject(
        playerId,
        0,
        0,
        new engine.Inputs())

      this.players[playerId] = player
    }

    setPlayerUsername (playerId, username) {
      this.players[playerId].username = username
    }
  }

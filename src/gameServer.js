const engine = require('./engine.js')
const constants = require('./constants.js')

module.exports =
  class GameServer {
    constructor () {
      this.players = {}
    }

    logic (delta) {
      for (let playerId in this.players) {
        engine.applyInputsClamped(this.players[playerId],
          delta,
          constants.ACCEL,
          constants.MAX_SPEED,
          constants.MAP_BOUNDARIES
          )
      }
    }

    onPlayerConnected (playerId, x, y) {
      const player = new engine.PlayerObject(
        playerId,
        x,
        y
      )
      console.log(player.pos)

      this.players[playerId] = player
    }

    onPlayerDisconnected (playerId) {
      delete this.players[playerId]
    }

    onPlayerMoved (playerId, inputs) {
      const player = this.players[playerId]
      player.timestamp = Date.now()
      player.inputs = inputs
      this.players[playerId] = player
    }
  }

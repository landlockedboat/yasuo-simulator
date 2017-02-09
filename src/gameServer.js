const engine = require('./engine.js')
const constants = require('./constants.js')

module.exports =
  class GameServer {
    constructor () {
      this.players = {}
      this.tornados = {}
    }

    logic (delta) {
      for (let playerId in this.players) {
        engine.applyInputsClamped(this.players[playerId],
          delta,
          constants.ACCEL,
          constants.MAX_SPEED,
          constants.MAP_BOUNDARIES
        )
        this.players[playerId].tornados.forEach((tornado) => {
          engine.applySpeed(tornado, delta, constants.MAP_BOUNDARIES)
        })
      }
    }

    onPlayerConnected (playerId, x, y) {
      const player = new engine.PlayerObject(
        playerId,
        x,
        y
      )
      player.tornados = []
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

    onCreateTornado (playerId, tornadoPos) {
      var player = this.players[playerId]
      // a tornado holds a position
      player.tornados.push({
        velocity: new engine.Vector(1, 1),
        pos: new engine.Vector(tornadoPos.x, tornadoPos.y)
      })
      this.players[playerId] = player
    }
  }

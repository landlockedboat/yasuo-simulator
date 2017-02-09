const engine = require('./engine.js')
const utils = require('./utils.js')
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
          constants.DAMP_FACTOR,
          constants.MAX_SPEED,
          constants.MAP_BOUNDARIES
        )
        var reloadingTime = this.players[playerId].reloadingTime
        reloadingTime -= delta
        this.players[playerId].reloadingTime = utils.clamp(reloadingTime, 0, constants.RELOADING_TIME)
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
      player.reloadingTime = 0
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

    onCreateTornado (playerId, tornadoPos, tornadoSpeed) {
      var player = this.players[playerId]
      // a tornado holds a position
      player.tornados.push({
        velocity: tornadoSpeed,
        pos: new engine.Vector(tornadoPos.x, tornadoPos.y)
      })
      this.players[playerId] = player
    }
  }

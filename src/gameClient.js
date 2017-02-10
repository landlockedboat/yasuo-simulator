var constants = require('./constants.js')
var engine = require('./engine.js')

module.exports =
  class GameClient {
    constructor () {
      this.players = {}
      this.tornados = []
    }
    logic (delta) {
      // COMMON BETWEEN SERVER AND CLIENT
      for (let playerId in this.players) {
        var player = this.players[playerId]
        if (player.isAirbone) {
          player.airboneTime -= delta
          if (player.airboneTime <= 0) {
            this.players[playerId].isAirbone = false
            this.players[playerId].airboneTime = 0
          }
          // We skip this logic loop, player was airbone
          continue
        }
        if (player.dead) {
          continue
        }
        engine.applyInputsClamped(this.players[playerId],
          delta,
          constants.ACCEL,
          constants.DAMP_FACTOR,
          constants.MAX_SPEED,
          constants.MAP_BOUNDARIES
        )
      }
      this.tornados.forEach((tornado) => {
        engine.applySpeed(tornado, delta, constants.MAP_BOUNDARIES)
      })
    }
  }

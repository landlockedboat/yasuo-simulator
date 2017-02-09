var constants = require('./constants.js')
var engine = require('./engine.js')

module.exports =
  class GameClient {
    constructor () {
      this.players = {}
      this.tornados = []
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
      }
      this.tornados.forEach((tornado) => {
        engine.applySpeed(tornado, delta, constants.MAP_BOUNDARIES)
      })
    }
  }

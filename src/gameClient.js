var constants = require('./constants.js')
var engine = require('./engine.js')

module.exports =
  class GameClient {
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
  }

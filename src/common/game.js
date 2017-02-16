const engine = require('../common/engine.js')
const constants = require('../common/constants.js')

module.exports = class Game {
  constructor () {
    this.players = {}
    this.tornados = []
  }

  // forEachPlayerCallback is optional
  logic (delta, forEachPlayerCallback) {
    this.hasAirbonePlayers = false
    for (let playerId in this.players) {
      var player = this.players[playerId]
      if (player.isAirbone) {
        this.hasAirbonePlayers = true
        player.airboneTime -= delta
        if (player.airboneTime <= 0) {
          this.players[playerId].isAirbone = false
          this.players[playerId].airboneTime = 0
        }
        // We skip this logic loop, player was airbone
        continue
      }
      if (player.isDead) {
        continue
      }
      engine.applyInputsClamped(this.players[playerId],
                delta,
                constants.MAX_SPEED,
                constants.MAP_BOUNDARIES
            )
      // If the callback exists, we call it
      if (forEachPlayerCallback) { forEachPlayerCallback(delta, playerId) }
    }
    this.tornados.forEach((tornado) => {
      engine.applySpeed(tornado, delta, constants.MAP_BOUNDARIES)
    })
  }
}

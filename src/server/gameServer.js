const engine = require('../common/engine.js')
const utils = require('../common/utils.js')
const constants = require('../common/constants.js')
const Game = require('../common/game.js')

module.exports =
  class GameServer extends Game {
    logic (delta) {
      // We do a generic logic loop and we pass it the forEachPlayerLogic callback
      // to execute the function for each player
      super.logic(delta, this.forEachPlayerLogic.bind(this))
    }

    forEachPlayerLogic (delta, playerId) {
      var reloadingTime = this.players[playerId].reloadingTime
      reloadingTime -= delta
      this.players[playerId].reloadingTime = utils.clamp(reloadingTime, 0, constants.RELOADING_TIME)
    }

    onPlayerConnected (playerId, x, y) {
      const player = new engine.PlayerObject(
        playerId,
        x,
        y
      )
      player.reloadingTime = 0
      player.airboneTime = 0
      player.isAirbone = false
      player.isDead = false
      player.score = 0
      this.players[playerId] = player
    }

    onPlayerDisconnected (playerId) {
      delete this.players[playerId]
    }

    onPlayerMoved (playerId, inputs) {
      const player = this.players[playerId]
      if (player.isAirbone) {
        return
      }
      player.timestamp = Date.now()
      player.inputs = inputs
      this.players[playerId] = player
    }

    onCreateTornado (playerId, playerPos, mousePos) {
      // We get the vector from playerPos to mousePos
      var tornadoSpeed = engine.Vector.vectorBetween(playerPos, mousePos)
      // And we normalize it
      tornadoSpeed.normalize()
      // And multiply it by the tornado speed
      tornadoSpeed.times(constants.TORNADO_SPEED)

      // creating the actual tornado...
      this.tornados.push({
        velocity: tornadoSpeed,
        pos: new engine.Vector(playerPos.x, playerPos.y),
        prop: playerId
      })
    }
  }

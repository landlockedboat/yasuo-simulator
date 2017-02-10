const engine = require('./engine.js')
const utils = require('./utils.js')
const constants = require('./constants.js')

module.exports =
  class GameServer {
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

        engine.applyInputsClamped(this.players[playerId],
          delta,
          constants.ACCEL,
          constants.DAMP_FACTOR,
          constants.MAX_SPEED,
          constants.MAP_BOUNDARIES
        )
        // BEGIN SERVER ONLY
        var reloadingTime = this.players[playerId].reloadingTime
        reloadingTime -= delta
        this.players[playerId].reloadingTime = utils.clamp(reloadingTime, 0, constants.RELOADING_TIME)
        // END SERVER ONLY
      }
      this.tornados.forEach((tornado) => {
        engine.applySpeed(tornado, delta, constants.MAP_BOUNDARIES)
      })
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

    onAttack (playerId, attackInputs, playerPos, mousePos) {
      const player = this.players[playerId]
      if (player.isAirbone) {
        return
      }
      if (attackInputs.Q_KEY) {
        if (player.reloadingTime <= 0) {
          player.reloadingTime = constants.RELOADING_TIME
          this.onCreateTornado(playerId, playerPos, mousePos)
        }
      }
      this.players[playerId] = player
    }

    onCreateTornado (playerId, playerPos, mousePos) {
      // We get the vector from playerPos to mousePos
      var tornadoSpeed = engine.vectorBetween(playerPos, mousePos)
      console.log(tornadoSpeed)
      // And we normalize it
      tornadoSpeed = engine.vectorNormalize(tornadoSpeed)
      // And multiply it by the tornado speed
      tornadoSpeed = engine.vectorTimes(tornadoSpeed, constants.TORNADO_SPEED)

      // creating the actual tornado...
      this.tornados.push({
        velocity: tornadoSpeed,
        pos: new engine.Vector(playerPos.x, playerPos.y),
        prop: playerId
      })
    }
  }

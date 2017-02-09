var utils = require('./utils.js')

// Inputs
exports.Inputs =
  class Inputs {
    constructor () {
      this.LEFT_ARROW = false
      this.RIGHT_ARROW = false
      this.UP_ARROW = false
      this.DOWN_ARROW = false
    }
  }

exports.AttackInputs =
  class AttackInputs {
    constructor () {
      this.Q_KEY = false
      this.R_KEY = false
    }
  }

// Vector class
exports.Vector =
  class Vector {
    constructor (x = 0, y = 0) {
      this.x = x
      this.y = y
    }
  }

// GameObject and its children
exports.GameObject =
  class GameObject {
    constructor (id, x = 0, y = 0) {
      this.id = id
      this.pos = new exports.Vector(x, y)
    }
  }

exports.PlayerObject =
  class PlayerObject extends exports.GameObject {
    constructor (id, x, y) {
      super(id, x, y)
      // velocity
      this.velocity = new exports.Vector(0, 0)
      this.score = 0
      this.name = ''
      this.inputs = new exports.Inputs()
      this.attackInputs = new exports.AttackInputs()
    }
  }

exports.vectorDamp = function (vector, dampFactor) {
  vector.x *= dampFactor
  vector.y *= dampFactor
}

exports.vectorBetween = function (vector1, vector2) {
  let dx = vector2.x - vector1.x
  let dy = vector2.y - vector1.y
  return new exports.Vector(dx, dy)
}

// Caution! Calculus-intensive function! Use at your own risk!
exports.vectorNormalize = function (vector) {
  let len = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
  return new exports.Vector(vector.x / len, vector.y / len)
}

exports.vectorTimes = function (vector, num) {
  return new exports.Vector(vector.x * num, vector.y * num)
}

exports.applySpeed = function (object, delta) {
  object.pos.x += object.velocity.x * delta
  object.pos.y += object.velocity.y * delta
}

exports.applyInputsClamped = function (player, delta, accel, dampFactor, maxSpeed, boundaries) {
  let vInc = accel * delta
  if (player.inputs.LEFT_ARROW) player.velocity.x -= vInc
  if (player.inputs.RIGHT_ARROW) player.velocity.x += vInc
  if (player.inputs.UP_ARROW) player.velocity.y -= vInc
  if (player.inputs.DOWN_ARROW) player.velocity.y += vInc

  player.velocity.x = utils.clampAbs(player.velocity.x, maxSpeed)
  player.velocity.y = utils.clampAbs(player.velocity.y, maxSpeed)

  exports.applySpeed(player, delta)
  // we damp the speed of the player
  exports.vectorDamp(player.velocity, dampFactor)

  player.pos.x = utils.clamp(player.pos.x, 0, boundaries.x)
  player.pos.y = utils.clamp(player.pos.y, 0, boundaries.y)

  if (utils.isClamped(player.pos.x, 0, boundaries.x)) {
    player.velocity.x = 0
  }
  if (utils.isClamped(player.pos.y, 0, boundaries.y)) {
    player.velocity.y = 0
  }
}

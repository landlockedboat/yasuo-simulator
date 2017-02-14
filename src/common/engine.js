var utils = require('./utils.js')
var deepcopy = require('deepcopy')

// Inputs
exports.Inputs =
  class Inputs {
    constructor () {
      this.A_KEY = false
      this.D_KEY = false
      this.W_KEY = false
      this.S_KEY = false
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

exports.vectorBetween = function (origin, destination) {
  let dx = destination.x - origin.x
  let dy = destination.y - origin.y
  return new exports.Vector(dx, dy)
}

exports.vectorMagnitude = function (vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
}

// Caution! Calculus-intensive function! Use at your own risk!
exports.vectorNormalize = function (vector) {
  let len = exports.vectorMagnitude(vector)
  if (len !== 0) {
    return new exports.Vector(vector.x / len, vector.y / len)
  } else {
    return new exports.Vector()
  }
}

exports.vectorTimes = function (vector, num) {
  return new exports.Vector(vector.x * num, vector.y * num)
}

exports.vectorSum = function (vector1, vector2) {
  return new exports.Vector(vector1.x + vector2.x, vector1.y + vector2.y)
}

exports.vectorMoveTo = function (vector1, vector2, ammount, closeEnough) {
  let delta = exports.vectorBetween(vector1, vector2)
  if (exports.vectorMagnitude(delta) < closeEnough) {
    return deepcopy(vector2)
  }

  delta = exports.vectorNormalize(delta)
  delta = exports.vectorTimes(delta, ammount)
  return exports.vectorSum(vector1, delta)
}

exports.applySpeed = function (object, delta) {
  object.pos.x += object.velocity.x * delta
  object.pos.y += object.velocity.y * delta
}

exports.applyInputsClamped = function (player, delta, maxSpeed, boundaries) {
  if (player.inputs.A_KEY) player.pos.x -= maxSpeed * delta
  if (player.inputs.D_KEY) player.pos.x += maxSpeed * delta
  if (player.inputs.W_KEY) player.pos.y -= maxSpeed * delta
  if (player.inputs.S_KEY) player.pos.y += maxSpeed * delta

  player.pos.x = utils.clamp(player.pos.x, 0, boundaries.x)
  player.pos.y = utils.clamp(player.pos.y, 0, boundaries.y)
}

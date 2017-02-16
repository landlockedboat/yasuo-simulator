var utils = require('./utils.js')

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

    clone (vector) {
      this.x = vector.x
      this.y = vector.y
    }

    damp (dampFactor) {
      this.x *= dampFactor
      this.y *= dampFactor
    }

    // Calculus-intensive function
    magnitude () {
      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    // Calculus-intensive function
    normalize () {
      let len = this.magnitude()
      if (len !== 0) {
        this.x /= len
        this.y /= len
      } else {
        this.x = 0
        this.y = 0
      }
    }

    times (num) {
      this.x *= num
      this.y *= num
    }

    sum (vector) {
      this.x += vector.x
      this.y += vector.y
    }

    moveTo (vector2, ammount, closeEnough) {
      let delta = exports.Vector.vectorBetween(this, vector2)

      if (delta.magnitude(delta) < closeEnough) {
        this.x = vector2.x
        this.y = vector2.y
        return
      }

      delta.normalize()
      delta.times(ammount)
      this.sum(delta)
    }
  }

exports.Vector.vectorBetween = function (origin, destination) {
  let dx = destination.x - origin.x
  let dy = destination.y - origin.y
  return new exports.Vector(dx, dy)
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

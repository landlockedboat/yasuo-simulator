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
    constructor (id, x, y, inputs) {
      super(id, x, y)
      // velocity
      this.velocity = new exports.Vector(0, 0)
      this.score = 0
      this.name = ''
      this.inputs = inputs
    }
  }

// visuals
exports.Sprite =
  class Sprite {

  }
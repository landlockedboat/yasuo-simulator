var PIXI = require('pixi.js')

module.exports =
    class GameRenderer {
      constructor (spritePaths) {
        this.app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb})
        // app.view is the renderer
        document.body.appendChild(this.app.view)
        this.stage = new PIXI.Stage()
        this.sprites = {}
        for (let path in spritePaths) {
          var tex = PIXI.Texture.fromImage(path)
          var sprite = new PIXI.Sprite(tex)
          this.stage.addChild(sprite)
          // FIXME: need a betten index
          this.sprites[path] = sprite
        }
      }

      render (delta, gameClient) {
        // for (let playerId in gameClient.players) {

        // }
      }
    }

var imgdye = require('imgdye')

module.exports =
  class GameRenderer {
    constructor (onClickCallback) {
      const canvas = document.getElementById('main.canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.mousePos = {}

      this.playerSprite = document.getElementById('player.sprite')
      this.tornadoSprite = document.getElementById('tornado.sprite')
      this.cursorSprite = document.getElementById('cursor.sprite')
      this.bgSprite = document.getElementById('bg.sprite')
      // add an event listener for the mouse
      canvas.addEventListener('mousemove', function (evt) {
        var rect = this.canvas.getBoundingClientRect()
        this.mousePos = {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        }
      }.bind(this), false)
    }

    registerOnClickCallback (onClickCallback) {
      this.canvas.addEventListener('click', onClickCallback)
    }

    render (delta, client) {
      // Repaint the background
      this.ctx.fillStyle = 'white'
      this.ctx.drawImage(this.bgSprite, 0, 0, window.innerWidth, window.innerHeight)
      var airbonePlayer
      // Draw the player images
      for (let playerId in client.players) {
        const player = client.players[playerId]
        const pos = player.pos
        this.ctx.strokeStyle = 'black'
        this.ctx.fillStyle = 'black'
        this.ctx.lineWidth = 5
        var currentSprite = this.playerSprite
        if (player.dead) {
          currentSprite = imgdye(currentSprite, '#FF0000', 0.5)
        } else if (player.isAirbone) {
          currentSprite = imgdye(currentSprite, '#0000FF', 0.5)
          airbonePlayer = player
        }
        this.ctx.drawImage(currentSprite, pos.x - 25, pos.y - 25, 50, 50)

        var username = player.username
        this.ctx.font = '20px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(username, pos.x, pos.y - 50)
      }
      client.tornados.forEach((tornado) => {
        const tpos = tornado.pos
        this.ctx.drawImage(this.tornadoSprite, tpos.x - 25, tpos.y - 30, 50, 60)
      })

      if (airbonePlayer && airbonePlayer.id !== client.myPlayerId) {
        this.ctx.font = '100px Arial'
        this.ctx.fillStyle = 'red'
        this.ctx.fillText('PRESS R!', this.canvas.width / 2, 200)
      }

      this.ctx.drawImage(this.cursorSprite, this.mousePos.x - 20, this.mousePos.y - 20, 40, 40)
    }
  }

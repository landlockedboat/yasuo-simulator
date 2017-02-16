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
      this.currentRotation = 0
    }

    registerOnClickCallback (onClickCallback) {
      this.canvas.addEventListener('click', onClickCallback)
    }

    renderBackground () {
      this.ctx.fillStyle = 'white'
      this.ctx.globalAlpha = 0.5
      this.ctx.drawImage(this.bgSprite, 0, 0, window.innerWidth,
        window.innerHeight)
      this.ctx.globalAlpha = 1
    }

    renderPlayer (client, vPlayer, player) {
      var currentSprite = this.playerSprite
      // For the username and score texts
      this.ctx.font = '20px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = 'black'
      // For the player server position
      this.ctx.strokeStyle = 'black'
      this.ctx.lineWidth = 5
      // Cache the player's positions
      const vPos = vPlayer.pos
      const pPos = player.pos
      // For rotating stuff
      this.ctx.save()
      // Move the context to the player's sprite origin
      // This is for executing rotations effectively.
      this.ctx.translate(vPos.x, vPos.y)
      // Tint the sprite based on the player state
      if (player.isDead) {
        currentSprite = imgdye(currentSprite, '#FF0000', 0.5)
      } else if (player.isAirbone) {
        // Airbone state
        this.ctx.rotate(this.currentRotation)
        currentSprite = imgdye(currentSprite, '#0000FF', 0.5)
      }
      // Draw the actual player sprite
      this.ctx.drawImage(currentSprite, -25, -25, 50, 50)
      // Draw the username above the player
      this.ctx.fillText(player.username, 0, -50)
      // Draw the score
      this.ctx.fillText(`kills: ${player.score}`, 0, 50)
      // Reset the context rotation and coordinates
      this.ctx.restore()
      // Draw the player's server position if in debug mode
      if (client.isInDebugMode) {
        this.ctx.strokeRect(pPos.x - 25, pPos.y - 25, 50, 50)
      }
      // Increase the rotation for animating the airbone state
      this.currentRotation += 0.1
    }

    renderTornado (tornado) {
      const tpos = tornado.pos
      this.ctx.drawImage(this.tornadoSprite, tpos.x - 25, tpos.y - 30, 50, 60)
    }

    render (delta, client) {
      // Repaint the background
      this.renderBackground()
      // Render some debug info if in debug mode
      if (client.isInDebugMode) {
        this.ctx.fillText('DEBUG MODE (PRESS 1 TO EXIT)', 25, 50)
        this.ctx.fillText(`PING: ${client.ping}`, 25, 75)
        this.ctx.fillText(`CLOCK DIFF: ${client.clockDiff}`, 25, 100)
      }
      // Render the player images
      for (let playerId in client.players) {
        const vPlayer = client.virtualPlayers[playerId]
        const player = client.players[playerId]
        this.renderPlayer(client, vPlayer, player)
      }
      // Render the PRESS R! text
      const myPlayer = client.players[client.myPlayerId]
      if (client.hasAirbonePlayers && !myPlayer.isAirbone) {
        this.ctx.font = '100px Arial'
        this.ctx.fillStyle = 'red'
        this.ctx.fillText('PRESS R!', this.canvas.width / 2, 200)
      }
      // Render tornados
      client.tornados.forEach(this.renderTornado.bind(this))
      // Draw the mouse
      this.ctx.drawImage(this.cursorSprite, this.mousePos.x - 20, this.mousePos.y - 20, 40, 40)
    }
  }

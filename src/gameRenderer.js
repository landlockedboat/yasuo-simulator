module.exports =
  class GameRenderer {
    constructor (onClickCallback) {
      const canvas = document.getElementById('main.canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.mousePos = {}

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
      this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      // Draw the player images
      for (let playerId in client.players) {
        const player = client.players[playerId]
        const pos = player.pos
        this.ctx.strokeStyle = 'black'
        this.ctx.fillStyle = 'black'
        this.ctx.lineWidth = 5
        this.ctx.strokeRect(pos.x - 25, pos.y - 25, 50, 50)

        var username = player.username
        this.ctx.font = '20px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(username, pos.x, pos.y - 50)
      }
      client.tornados.forEach((tornado) => {
        const tpos = tornado.pos
        this.ctx.strokeRect(tpos.x - 10, tpos.y - 10, 20, 20)
      })

      this.ctx.strokeRect(this.mousePos.x - 10, this.mousePos.y - 10, 20, 20)
    }
  }

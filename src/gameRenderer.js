module.exports =
  class GameRenderer {
    constructor () {
      const canvas = document.getElementById('main.canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      this.ctx = canvas.getContext('2d')
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
    }
  }

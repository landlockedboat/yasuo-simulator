// for standard
/* globals Audio */
// Audio manager class
module.exports =
    class GameAudio {
      constructor (soundsPath, soundsAmmount) {
        this.soundsAmmount = soundsAmmount
        this.sounds = {}
            // soundsPath is a dictionary of paths pointing to various sound fx.
        for (let soundName in soundsPath) {
          this.createSoundCollection(soundName, soundsPath[soundName])
        }
      }

      createSoundCollection (soundName, soundPath) {
        var soundsCollection = []
        for (let i = 0; i < this.soundsAmmount; ++i) {
          soundsCollection[i] = new Audio(soundPath)
        }
        this.sounds[soundName] = soundsCollection
      }

      play (soundName) {
        var soundCollection = this.sounds[soundName]

        for (let i = 0; i < this.soundsAmmount; ++i) {
          const sound = soundCollection[i]
          if (sound.duration > 0 && !sound.paused) {
            // The sound is playing
            continue
          } else {
            sound.play()
            break
          }
        }
      }
    }

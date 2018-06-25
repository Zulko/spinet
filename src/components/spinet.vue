<template lang='pug'>
.prototype
  h1 Spinet
  svg.keyboard(width="100%" height="auto" viewBox="0 0 17 7")
    g.key(v-for="key, i in keyboard", :key="i",
          :class="keyClass(key)")
      rect(
        width="0.8" height="0.8"
        :x="parseFloat(key.xPosition) + 0.1"
        :y="parseFloat(key.yPosition) + 0.1"
        rx="0.05"
        ry="0.05"
      )
      text.small(
        :x="parseFloat(key.xPosition) + 0.5"
        :y="parseFloat(key.yPosition) + 0.65"
      ) {{ keyDisplay === 'key' ? key.symbol : noteName(key.note).replace('#', '♯') }}

</template>

<script>
import Pizzicato from 'pizzicato'
const keyboardTypes = {
  english_uk_typewriter: require('../assets/keyboards/english_uk_typewriter.tsv')
}

export default {
  name: 'spinet',
  data () {
    return {
      keySounds: {},
      keyDisplay: 'note',
      keyboardType: 'english_uk_typewriter',
      keyboardTypes: keyboardTypes,
      lastPressed: '',
      pressedKeys: new Set([]),
      soundParameters: {
        waveType: 'triangle',
        attack: 0,
        reverb: {
          time: 0.01,
          decay: 0.01,
          reverse: true,
          mix: 0.8
        }
      }
    }
  },
  computed: {
    keyboard () {
      return this.keyboardTypes[this.keyboardType]
    }
  },
  methods: {
    onKeyDown (evt) {
      evt.preventDefault()
      this.pressedKeys.add(evt.key)
      this.keySounds[evt.key].play()
      this.lastPressed = evt.key
      this.$forceUpdate()
    },
    onKeyUp (evt) {
      evt.preventDefault()
      this.pressedKeys.delete(evt.key)
      this.keySounds[evt.key].stop()
      this.$forceUpdate()
    },
    bindKeys () {
      var self = this
      this.keyboard.map(function (key) {
        console.log(key)
        var freq = self.note2freq(key.note)
        var sound = self.generateSound(freq)
        self.keySounds[key.key] = sound
      })
    },
    noteName (note) {
      return note.slice(0, note.length - 1)
    },
    noteScale (note) {
      return parseInt(note.slice(note.length - 1, note.length))
    },
    note2freq (note) {
      var index = 'C C# D D# E F F# G G# A A# B'.split(' ').indexOf(this.noteName(note))
      var noteNumber = 12 * this.noteScale(note) + index
      return 440 * Math.pow(2, (noteNumber - 49) / 12)
    },
    generateSound (freq) {
      var snd = new Pizzicato.Sound({
        source: 'wave',
        options: {
          type: this.soundParameters.waveType,
          frequency: freq,
          attack: this.soundParameters.attack
        }
      })
      snd.addEffect(new Pizzicato.Effects.Reverb(this.soundParameters.reverb))
      return snd
    },
    keyClass (key) {
      return [
        key.class,
        {
          sharp: key.note.indexOf('#') > -1
        },
        {
          pressed: this.pressedKeys.has(key.key)
        }
      ]
    }
  },
  mounted () {
    this.bindKeys()
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  },
  watch: {
    pressedKeys (value) {
      console.log('keypress', value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss' scoped>
@import url('https://fonts.googleapis.com/css?family=Niconne');
h1 {
  font-family: 'Niconne';
  text-align: center;
  font-size: 5em;
  font-weight: normal;
}

svg.keyboard {
  text {
    font: bold 0.4px 'Open Sans';
    fill: grey;
    text-anchor: middle;
  }
  .key {
    rect {
      stroke-width: 0.02;
      stroke: #888;
      fill:#eee;
    }

    &.sharp {
      rect {
        fill:#888;
      }
      text {
        fill: #333
      }
    }

    &.right-separation rect {
      stroke:#74749c;
      stroke-width: 0.1;
      stroke-dasharray: 0.0, 0.75, 0.75, 3.2
    }
    &.left-separation rect {
      stroke:#669;
      stroke-width: 0.1;
      stroke-dasharray: 0, 2.3, 0.75, 0.1
    }

    &.pressed rect {
      stroke:#88c;
      stroke-width: 0.15;
      /* transition: all 0.02s; */
      stroke-dasharray: none
    }

  }
}
</style>

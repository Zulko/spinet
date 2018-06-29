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
      ) {{ keyDisplay(key) }}

  select(v-model="keyDisplayMode")
    option(value='key') Keyboard
    option(value='note_sharp') Notes (♯)
    option(value='note_bemol') Notes (♭)
    option(value='none') None

  select(v-model="synthesizer")
    option(value='wave') Wave
    option(value='soundfont') Sounfont

  select(v-model="soundfont" v-if="synthesizer === 'soundfont'")
    option(value='fluid') Fluid
    option(value='musyng') Musyng

  select(v-if="synthesizer === 'soundfont'" v-model="instrument")
    option(v-for='name in soundfontNames[soundfont]', :key='name', :value='name') {{ name.replace(/_/g, ' ')}}
</template>

<script>
import Pizzicato from 'pizzicato'
const noteParser = require('note-parser')
const sfPlayer = require('soundfont-player')
const soundfontNames = {
  fluid: require('soundfont-player/names/fluidR3.json'),
  musyng: require('soundfont-player/names/musyngkite.json')
}

const ac = new AudioContext()

function enharmonic (note) {
  var parsed = noteParser.parse(note)
  return noteParser.build(parsed.step + parsed.alt, -1 * parsed.alt, parsed.oct)
}

const keyboardTypes = {
  english_uk_typewriter: require('../assets/keyboards/english_uk_typewriter.tsv')
}

export default {
  name: 'spinet',
  data () {
    return {
      keyNotes: {},
      noteSounds: {},
      keyDisplayMode: 'note_sharp',
      keyboardType: 'english_uk_typewriter',
      keyboardTypes: keyboardTypes,
      lastPressed: '',
      pressedKeys: new Set([]),
      playingNotes: new Set([]),
      synthesizer: 'wave',
      instrument: 'clavinet',
      soundfont: 'fluid',
      soundfontNames: soundfontNames,
      waveParameters: {
        source: 'wave',
        options: {
          type: 'triangle',
          loop: false,
          attack: 0,
          relase: 0.2
        },
        effects: {
          reverb: {
            time: 0.01,
            decay: 0.01,
            reverse: true,
            mix: 0.8
          }
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
      if (this.pressedKeys.has(evt.key)) {
        return
      }
      this.lastPressed = evt.key
      this.pressedKeys.add(evt.key)
      var note = this.keyNotes[evt.key]
      if (this.playingNotes.has(note)) {
        return
      }
      this.playingNotes.add(note)
      this.noteSounds[note].play()
      this.$forceUpdate()
    },
    onKeyUp (evt) {
      evt.preventDefault()
      this.pressedKeys.delete(evt.key)
      var note = this.keyNotes[evt.key]
      this.noteSounds[note].stop()
      this.playingNotes.delete(note)
      this.$forceUpdate()
    },
    bindKeys () {
      var self = this
      this.keyboard.map(function (key) {
        self.keyNotes[key.key] = key.note
      })
    },
    bindNotes () {
      var self = this
      if (this.synthesizer === 'soundfont') {
        sfPlayer.instrument(ac, this.instrument, {soundfont: 'MusyngKite'}).then(function (instrument) {
          self.instrumentSoundfont = instrument
        })
        this.keyboard.map(function (key) {
          console.log(key.note)
          self.noteSounds[key.note] = {
            play () {
              self.noteSounds[key.note].playing = self.instrumentSoundfont.play(key.note)
            },
            stop () { self.noteSounds[key.note].playing.stop() }
          }
        })
      } else {
        this.keyboard.map(function (key) {
          var options = Object.assign({}, self.waveParameters.options)
          options.frequency = noteParser.parse(key.note).freq
          var sound = new Pizzicato.Sound({source: 'wave', options})
          self.noteSounds[key.note] = sound
        })
      }
    },
    createSound (note) {
      var synth = this.synthesizer
      var options = Object.assign({}, synth.options)
      if (synth.source === 'wave') {
        var parsedNote = noteParser.parse(note)
        options.frequency = parsedNote.freq
      } else if (synth.source === 'file') {
        options.path = options.path(note, options.instrument)
      }
      var sound = new Pizzicato.Sound({
        source: synth.source,
        options
      })
      if (synth.effects.reverb) {
        var reverb = new Pizzicato.Effects.Reverb(synth.effects.reverb)
        sound.addEffect(reverb)
      }
      return sound
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
    },
    keyDisplay (key) {
      var note = noteParser.parse(key.note)
      return {
        'none': '',
        'key': key.symbol,
        'note_sharp': note.pc.replace('#', '♯'),
        'note_bemol': enharmonic(note.pc).replace('b', '♭')
      }[this.keyDisplayMode]
    }
  },
  mounted () {
    this.bindKeys()
    this.bindNotes()
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  },
  watch: {
    pressedKeys (value) {
      console.log('keypress', value)
    },
    synthesizer: {
      deep: true,
      handler (value) {
        this.bindNotes()
      }
    },
    instrument (value) {
      this.bindNotes()
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

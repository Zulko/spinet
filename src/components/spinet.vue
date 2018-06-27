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

  select(v-model="synthesizer.source")
    option(value='wave') wave
    option(value='file') instrument

  select(v-if="synthesizer.source === 'file'" v-model="synthesizer.options.instrument")
    option(v-for='name in instrumentNames', :key='name', :value='name') {{ name.replace(/_/g, ' ')}}
</template>

<script>
import Pizzicato from 'pizzicato'
import music from '../music'
console.log(music)
const keyboardTypes = {
  english_uk_typewriter: require('../assets/keyboards/english_uk_typewriter.tsv')
}

const instrumentNames = require('../assets/instruments_names.tsv').map(e => e.name)

export default {
  name: 'spinet',
  data () {
    return {
      keySounds: {},
      keyDisplayMode: 'note_sharp',
      keyboardType: 'english_uk_typewriter',
      keyboardTypes: keyboardTypes,
      lastPressed: '',
      pressedKeys: new Set([]),
      instrumentNames: instrumentNames,
      synthesizer: {
        source: 'wave',
        options: {
          type: 'triangle',
          instrument: 'clavinet',
          path: function (note, instrument) {
            note = music.enharmonics[music.noteWithoutScale(note)] + music.noteScale(note)
            var url = `https://cdn.rawgit.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/${instrument}-mp3/${note}.mp3`
            console.log(url)
            return url
          },
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
        self.keySounds[key.key] = self.createSound(key.note)
      })
    },
    createSound (note) {
      var synth = this.synthesizer
      var options = Object.assign({}, synth.options)
      if (synth.source === 'wave') {
        options.frequency = music.noteFrequency(note)
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
      return {
        'none': '',
        'key': key.symbol,
        'note_sharp': music.noteWithoutScale(key.note).replace('#', '♯'),
        'note_bemol': music.enharmonics[music.noteWithoutScale(key.note)].replace('b', '♭')
      }[this.keyDisplayMode]
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
    },
    'synthesizer.source': function (value) {
      this.bindKeys()
    },
    'synthesizer.options.instrument': function (value) {
      console.log('binding')
      this.bindKeys()
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

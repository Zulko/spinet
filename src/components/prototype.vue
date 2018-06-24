<template lang='pug'>
.prototype
  h1 Spinet
  //- .lastpressed {{ lastPressed }}
  svg.keyboard(width="100%" height="auto" viewBox="0 0 17 7")
    g.key(v-for="key, i in keyboard", :key="i",
          :class="[key.class, {sharp: key.note.indexOf('#') > -1}, {pressed: pressedKeys[key.key]}]")
      rect(
        width="0.8" height="0.8"
        :x="parseFloat(key.xPosition) + 0.1"
        :y="parseFloat(key.yPosition) + 0.1"
      )
      text.small(
        :x="parseFloat(key.xPosition) + 0.5"
        :y="parseFloat(key.yPosition) + 0.65"
      ) {{ key.symbol }}

</template>

<script>
import Pizzicato from 'pizzicato'
const keyboardTypes = {
  english_uk_typewriter: require('../assets/keyboards/english_uk_typewriter.tsv')
}
function sound (freq) {
  var snd = new Pizzicato.Sound({
    source: 'wave',
    options: {
      type: 'triangle',
      frequency: freq,
      attack: 0
    }
  })
  snd.addEffect(new Pizzicato.Effects.Reverb({
    time: 0.01,
    decay: 0.01,
    reverse: true,
    mix: 0.8
  }))
  return snd
}

export default {
  name: 'prototype',
  data () {
    var sounds = {}
    var pressedKeys = {}
    var keys = '\\ z x c v b a s d f g h q w e r t y 1 2 3 4 5 6 7 8 9 0 - = u i o p [ ] j k l ; \' # n m , . / AltGraph Backspace'
    // var keys = '\\ a z s x c f v g b h n q 2 w 3 e r 5 t 6 y 7 u i 9 o 0 p'
    keys.split(' ').map(function (key, i) {
      sounds[key] = sound(440 * Math.pow(2, (i - 20) / 12))
      pressedKeys[key] = false
    })
    return {
      msg: 'Welcome to Your Vue.js App',
      sounds: sounds,
      keyboardType: 'english_uk_typewriter',
      keyboardTypes: keyboardTypes,
      lastPressed: '',
      pressedKeys: pressedKeys
    }
  },
  computed: {
    keyboard () {
      return this.keyboardTypes[this.keyboardType]
    }
  },
  methods: {
    onKeyDown (evt) {
      this.lastPressed = evt.key
      this.sounds[evt.key].play()
      this.pressedKeys[evt.key] = true
    },
    onKeyUp (evt) {
      // console.log(evt)
      this.sounds[evt.key].stop()
      this.pressedKeys[evt.key] = false
    },
    test (evt) {
      console.log('test')
    }
  },
  mounted () {
    console.log('bla')
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    // sawtoothWave.play()
    // var sound = new Pizzicato.Sound()
    // sound.play()
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
    font: bold 0.5px sans-serif;
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
      stroke:#669;
      stroke-width: 0.1;
      stroke-dasharray: 0.0, 0.8, 0.8, 3.2
    }
    &.left-separation rect {
      stroke:#669;
      stroke-width: 0.1;
      stroke-dasharray: 0.0, 2.4, 0.8
    }

    &.pressed rect {
      stroke:#88c;
      stroke-width: 0.15;
      transition: all 0.05s;
      stroke-dasharray: none
    }

  }
}
</style>

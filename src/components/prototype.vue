<template lang='pug'>
.prototype
  .lastpressed {{ lastPressed }}
</template>

<script>
import Pizzicato from 'pizzicato'

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
    var keys = '\\ z x c v b a s d f g h q w e r t y 1 2 3 4 5 6 7 8 9 0 - = u i o p [ ] j k l ; \' # n m , . / AltGraph Backspace'
    // var keys = '\\ a z s x c f v g b h n q 2 w 3 e r 5 t 6 y 7 u i 9 o 0 p'
    keys.split(' ').map(function (key, i) {
      sounds[key] = sound(440 * Math.pow(2, (i - 20) / 12))
    })
    return {
      msg: 'Welcome to Your Vue.js App',
      sounds: sounds,
      lastPressed: ''
    }
  },
  methods: {
    onKeyDown (evt) {
      this.lastPressed = evt.key
      this.sounds[evt.key].play()
    },
    onKeyUp (evt) {
      // console.log(evt)
      this.sounds[evt.key].stop()
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
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

const scaleSharp = 'C C# D D# E F F# G G# A A# B'.split(' ')
const scaleFlat = 'C Db D Eb E F Gb G Ab A Bb B'.split(' ')

function noteWithoutScale (note) {
  return note.slice(0, note.length - 1)
}

function noteScale (note) {
  return parseInt(note.slice(note.length - 1, note.length))
}
function noteFrequency (note) {
  var index = scaleSharp.indexOf(this.noteWithoutScale(note))
  var noteNumber = 12 * this.noteScale(note) + index
  return 440 * Math.pow(2, (noteNumber - 49) / 12)
}

const enharmonics = {}
scaleSharp.map(function (note, i) {
  var otherNote = scaleFlat[i]
  enharmonics[note] = otherNote
  enharmonics[otherNote] = note
})

module.exports = {
  enharmonics,
  noteScale,
  noteFrequency,
  noteWithoutScale
}

import voice1 from '../audio/voice1.wav'
import voice2 from '../audio/voice2.wav'
import voice3 from '../audio/voice3.wav'
import voice4 from '../audio/voice4.wav'
import voice5 from '../audio/voice5.wav'
import voice6 from '../audio/voice6.wav'
import voice7 from '../audio/voice7.wav'
import voice8 from '../audio/voice8.wav'
import voice9 from '../audio/voice9.wav'
import voice10 from '../audio/voice10.wav'
import voice11 from '../audio/voice11.wav'
import voice12 from '../audio/voice12.wav'
import voice13 from '../audio/voice13.wav'
import voice14 from '../audio/voice14.wav'
import voice15 from '../audio/voice15.wav'
import voice16 from '../audio/voice16.wav'
import voice17 from '../audio/voice17.wav'
import voice18 from '../audio/voice18.wav'

function getSoundObject(voice) {
  if (voice === 2) {return voice1}
  if (voice === 2) {return voice2}
  if (voice === 3) {return voice3}
  if (voice === 4) {return voice4}
  if (voice === 5) {return voice5}
  if (voice === 6) {return voice6}
  if (voice === 7) {return voice7}
  if (voice === 8) {return voice8}
  if (voice === 9) {return voice9}
  if (voice === 10) {return voice10}
  if (voice === 11) {return voice11}
  if (voice === 12) {return voice12}
  if (voice === 13) {return voice13}
  if (voice === 14) {return voice14}
  if (voice === 15) {return voice15}
  if (voice === 16) {return voice16}
  if (voice === 17) {return voice17}
  if (voice === 18) {return voice18}
  
  return undefined
}

export function playVoice(voice) {
  const soundObject = getSoundObject(voice)
  if (soundObject) {
    const audio = new Audio()
    audio.play()
  }
}

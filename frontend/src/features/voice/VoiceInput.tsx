import { useState } from 'react'
import type { Language } from '../intake/model'

interface SpeechResultEvent { results: ArrayLike<ArrayLike<{ transcript: string }>> }
interface SpeechRecognitionLike {
  lang: string
  onresult: ((event: SpeechResultEvent) => void) | null
  onerror: (() => void) | null
  start: () => void
}
type SpeechConstructor = new () => SpeechRecognitionLike

export function VoiceInput({ language, onValue }: { language: Language; onValue: (value: string) => void }) {
  const [message, setMessage] = useState('')
  const browser = window as Window & {
    SpeechRecognition?: SpeechConstructor
    webkitSpeechRecognition?: SpeechConstructor
  }
  const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition
  if (!Constructor) return <p className="mt-2 text-xs text-stone-600">Voice input unavailable in this browser. Typing works normally.</p>
  function listen() {
    try {
      if (!Constructor) return
      const recognition = new Constructor()
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
      recognition.onresult = event => {
        const value = event.results[0]?.[0]?.transcript?.trim()
        if (!value) return
        onValue(value)
        setMessage('Captured: ' + value + '. Confirm or edit the text above.')
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(value)
          utterance.lang = recognition.lang
          window.speechSynthesis.speak(utterance)
        }
      }
      recognition.onerror = () => setMessage('Speech input failed. Please type the value.')
      recognition.start()
      setMessage('Listening…')
    } catch { setMessage('Speech input unavailable. Please type the value.') }
  }
  return <div className="mt-2">
    <button type="button" className="secondary text-sm" onClick={listen}>Speak village name</button>
    <p role="status" className="mt-2 text-xs text-stone-600">{message}</p>
  </div>
}

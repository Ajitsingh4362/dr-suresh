import { useEffect, useState } from 'react'

export default function Typewriter({ text, speed = 60, startDelay = 0, cursor = true }) {
  const [display, setDisplay] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplay('')
    setDone(false)
    let i = 0
    let timeoutId
    const startId = setTimeout(() => {
      const tick = () => {
        i += 1
        setDisplay(text.slice(0, i))
        if (i < text.length) {
          timeoutId = setTimeout(tick, speed)
        } else {
          setDone(true)
        }
      }
      tick()
    }, startDelay)
    return () => { clearTimeout(startId); clearTimeout(timeoutId) }
  }, [text, speed, startDelay])

  return (
    <span>
      {display}
      {cursor && (
        <span style={{
          display: 'inline-block', width: '2px', height: '1em', marginLeft: '2px',
          background: 'currentColor', verticalAlign: 'middle',
          animation: 'blink-cursor 0.8s step-end infinite',
          opacity: done ? 0.5 : 1,
        }} />
      )}
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  )
}

import { useEffect, useState } from 'react'

export default function Typewriter({ text, speed = 60, deleteSpeed = 30, startDelay = 0, pauseAfter = 1600, pauseBeforeRetype = 500, cursor = true, loop = false }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    let i = 0
    let mode = 'typing' // typing | pausing | deleting | waiting
    let timeoutId

    const tick = () => {
      if (mode === 'typing') {
        i += 1
        setDisplay(text.slice(0, i))
        if (i < text.length) {
          timeoutId = setTimeout(tick, speed)
        } else if (loop) {
          mode = 'pausing'
          timeoutId = setTimeout(tick, pauseAfter)
        }
      } else if (mode === 'pausing') {
        mode = 'deleting'
        timeoutId = setTimeout(tick, deleteSpeed)
      } else if (mode === 'deleting') {
        i -= 1
        setDisplay(text.slice(0, i))
        if (i > 0) {
          timeoutId = setTimeout(tick, deleteSpeed)
        } else {
          mode = 'waiting'
          timeoutId = setTimeout(tick, pauseBeforeRetype)
        }
      } else if (mode === 'waiting') {
        mode = 'typing'
        timeoutId = setTimeout(tick, speed)
      }
    }

    const startId = setTimeout(tick, startDelay)
    return () => { clearTimeout(startId); clearTimeout(timeoutId) }
  }, [text, speed, deleteSpeed, startDelay, pauseAfter, pauseBeforeRetype, loop])

  return (
    <span>
      {display}
      {cursor && (
        <span style={{
          display: 'inline-block', width: '2px', height: '1em', marginLeft: '2px',
          background: 'currentColor', verticalAlign: 'middle',
          animation: 'blink-cursor 0.8s step-end infinite',
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

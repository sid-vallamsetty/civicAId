import { useEffect, useState } from 'react'
import { PixelHourglass } from './PixelIcons.jsx'

function msUntilNextMidnight() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - now.getTime()
}

function formatHMS(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function ChallengeTimer() {
  const [remaining, setRemaining] = useState(msUntilNextMidnight)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(msUntilNextMidnight())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="challenge-timer" aria-live="polite">
      <PixelHourglass size={22} className="challenge-timer-icon" />
      <span className="challenge-timer-label">Challenges Refresh in:</span>
      <span className="challenge-timer-value">{formatHMS(remaining)}</span>
    </div>
  )
}

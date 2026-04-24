import { useState } from 'react'
import TopBar from './components/TopBar.jsx'
import ChallengeCard from './components/ChallengeCard.jsx'
import EvidenceInput from './components/EvidenceInput.jsx'
import EvidenceFeed from './components/EvidenceFeed.jsx'
import PixelGrid from './components/PixelGrid.jsx'
import { challenges, rankFor } from './data/challenges.js'
import { buildings, buildingById } from './data/buildings.js'
import { verifyEvidence } from './services/claude.js'

const ROWS = 8
const COLS = 10

function emptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill('empty'))
}

export default function App() {
  const [points, setPoints] = useState(0)
  const [streak, setStreak] = useState(1)
  const [log, setLog] = useState([])
  const [grid, setGrid] = useState(emptyGrid())
  const [activeChallenge, setActiveChallenge] = useState(challenges[0])
  const [submitting, setSubmitting] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0].id)

  const rank = rankFor(points)

  async function handleSubmitEvidence(text, file, previewUrl) {
    const trimmed = (text || '').trim()
    if ((!trimmed && !file) || submitting) return
    setSubmitting(true)
    const fileMeta = file
      ? { name: file.name, type: file.type, previewUrl: previewUrl || null }
      : null
    const evidenceLabel = trimmed
      || (file ? `[${file.type === 'application/pdf' ? 'PDF' : 'Image'}: ${file.name}]` : '')
    const entry = {
      id: Date.now(),
      challengeTitle: activeChallenge.title,
      evidence: evidenceLabel,
      file: fileMeta,
      status: 'pending',
      message: 'Claude is reviewing your submission...',
      pointsAwarded: 0
    }
    setLog(prev => [entry, ...prev])

    try {
      const result = await verifyEvidence(activeChallenge, trimmed, file)
      const awarded = result.approved ? activeChallenge.points : 0
      setLog(prev => prev.map(e => e.id === entry.id ? {
        ...e,
        status: result.approved ? 'approved' : 'rejected',
        message: result.reason || (result.approved ? 'Approved.' : 'Not approved.'),
        pointsAwarded: awarded
      } : e))
      if (result.approved) {
        setPoints(p => p + awarded)
        setStreak(s => s + 1)
      }
    } catch (err) {
      setLog(prev => prev.map(e => e.id === entry.id ? {
        ...e,
        status: 'error',
        message: err.message
      } : e))
    } finally {
      setSubmitting(false)
    }
  }

  function handlePlaceBuilding() {
    const b = buildingById(selectedBuilding)
    if (!b) return
    if (points < b.cost) {
      setLog(prev => [{
        id: Date.now(),
        challengeTitle: 'Build action',
        evidence: `Tried to place ${b.label}`,
        status: 'rejected',
        message: `Need ${b.cost - points} more points to place a ${b.label}.`,
        pointsAwarded: 0
      }, ...prev])
      return
    }
    let placed = false
    const next = grid.map(row => row.slice())
    outer: for (let r = next.length - 1; r >= 0; r--) {
      for (let c = 0; c < next[r].length; c++) {
        if (next[r][c] === 'empty') {
          next[r][c] = b.id
          placed = true
          break outer
        }
      }
    }
    if (!placed) {
      setLog(prev => [{
        id: Date.now(),
        challengeTitle: 'Build action',
        evidence: `Tried to place ${b.label}`,
        status: 'rejected',
        message: 'Your community grid is full! Amazing work.',
        pointsAwarded: 0
      }, ...prev])
      return
    }
    setGrid(next)
    setPoints(p => p - b.cost)
    setLog(prev => [{
      id: Date.now(),
      challengeTitle: 'Build action',
      evidence: `Placed a ${b.label}`,
      status: 'approved',
      message: `Your community grew! ${b.label} added to the grid.`,
      pointsAwarded: -b.cost
    }, ...prev])
  }

  return (
    <div className="app">
      <TopBar points={points} streak={streak} rank={rank} />
      <main className="layout">
        <section className="panel left-panel">
          <h2 className="panel-title">Challenges</h2>
          <div className="challenges">
            {challenges.map(ch => (
              <ChallengeCard
                key={ch.id}
                challenge={ch}
                active={activeChallenge.id === ch.id}
                onSelect={() => setActiveChallenge(ch)}
              />
            ))}
          </div>
          <EvidenceInput
            challenge={activeChallenge}
            onSubmit={handleSubmitEvidence}
            disabled={submitting}
          />
          <EvidenceFeed log={log} />
        </section>
        <section className="panel right-panel">
          <h2 className="panel-title">Your Community</h2>
          <PixelGrid grid={grid} />
          <div className="redeem">
            <label htmlFor="building-select" className="redeem-label">Redeem points:</label>
            <select
              id="building-select"
              className="redeem-select"
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.label} — {b.cost} pts
                </option>
              ))}
            </select>
            <button className="redeem-btn" onClick={handlePlaceBuilding}>
              Place
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

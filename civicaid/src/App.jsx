import { useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import ChallengeCard from './components/ChallengeCard.jsx'
import ChallengeTimer from './components/ChallengeTimer.jsx'
import EvidenceInput from './components/EvidenceInput.jsx'
import EvidenceFeed from './components/EvidenceFeed.jsx'
import PixelGrid from './components/PixelGrid.jsx'
import BuildMenu from './components/BuildMenu.jsx'
import { challenges, rankFor } from './data/challenges.js'
import { buildings, buildingById } from './data/buildings.js'
import { verifyEvidence } from './services/claude.js'

const ROWS = 8
const COLS = 10
const REMOVE_REFUND_RATIO = 0.5

function emptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill('empty'))
}

export default function App() {
  const [points, setPoints] = useState(10000)
  const [streak, setStreak] = useState(1)
  const [log, setLog] = useState([])
  const [grid, setGrid] = useState(emptyGrid())
  const [activeChallenge, setActiveChallenge] = useState(challenges[0])
  const [submitting, setSubmitting] = useState(false)

  // Build / interaction state
  const [tool, setTool] = useState(null) // null | { type:'place', buildingId } | { type:'remove' }
  const [dragHover, setDragHover] = useState(null) // [r,c] or null
  const dragRef = useRef(null) // { kind:'building', id } | { kind:'tile', from:[r,c] }

  const rank = rankFor(points)

  // ESC clears any active tool
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') clearTool()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function logBuildEvent(evidence, status, message, pointsAwarded = 0) {
    setLog(prev => [{
      id: Date.now() + Math.random(),
      challengeTitle: 'Build action',
      evidence,
      status,
      message,
      pointsAwarded
    }, ...prev])
  }

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

  // ---- Tool selection ------------------------------------------------------
  function selectBuildingTool(id) {
    setTool({ type: 'place', buildingId: id })
  }
  function toggleRemoveTool() {
    setTool(prev => (prev?.type === 'remove' ? null : { type: 'remove' }))
  }
  function clearTool() {
    setTool(null)
  }

  // ---- Grid mutations ------------------------------------------------------
  function placeBuildingAt(buildingId, r, c) {
    const b = buildingById(buildingId)
    if (!b) return false
    if (grid[r][c] !== 'empty') return false
    if (points < b.cost) {
      logBuildEvent(
        `Tried to place ${b.label}`,
        'rejected',
        `Need ${b.cost - points} more points to place a ${b.label}.`,
        0
      )
      return false
    }
    const next = grid.map(row => row.slice())
    next[r][c] = b.id
    setGrid(next)
    setPoints(p => p - b.cost)
    logBuildEvent(
      `Placed a ${b.label}`,
      'approved',
      `${b.label} added to plot (${r + 1}, ${c + 1}).`,
      -b.cost
    )
    return true
  }

  function removeBuildingAt(r, c) {
    const cell = grid[r][c]
    if (cell === 'empty') return false
    const b = buildingById(cell)
    const refund = Math.floor((b?.cost || 0) * REMOVE_REFUND_RATIO)
    const next = grid.map(row => row.slice())
    next[r][c] = 'empty'
    setGrid(next)
    if (refund > 0) setPoints(p => p + refund)
    logBuildEvent(
      `Removed ${b?.label || cell}`,
      'approved',
      refund > 0
        ? `Refunded ${refund} pts (50% of ${b?.cost || 0}).`
        : `Removed ${b?.label || cell}.`,
      refund
    )
    return true
  }

  function moveBuilding(fromR, fromC, toR, toC) {
    if (fromR === toR && fromC === toC) return false
    if (grid[toR][toC] !== 'empty') return false
    const cell = grid[fromR][fromC]
    if (cell === 'empty') return false
    const next = grid.map(row => row.slice())
    next[toR][toC] = cell
    next[fromR][fromC] = 'empty'
    setGrid(next)
    const b = buildingById(cell)
    logBuildEvent(
      `Moved ${b?.label || cell}`,
      'approved',
      `Relocated to plot (${toR + 1}, ${toC + 1}).`,
      0
    )
    return true
  }

  // ---- Tile click ----------------------------------------------------------
  function handleTileClick(r, c) {
    if (!tool) return
    if (tool.type === 'place') {
      placeBuildingAt(tool.buildingId, r, c)
    } else if (tool.type === 'remove') {
      removeBuildingAt(r, c)
    }
  }

  // ---- Drag and drop -------------------------------------------------------
  function handleBuildingDragStart(id, e) {
    dragRef.current = { kind: 'building', id }
    e.dataTransfer.effectAllowed = 'copy'
    try { e.dataTransfer.setData('text/plain', `building:${id}`) } catch {}
  }

  function handleTileDragStart(r, c, e) {
    if (grid[r][c] === 'empty') return
    dragRef.current = { kind: 'tile', from: [r, c] }
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', `tile:${r},${c}`) } catch {}
  }

  function handleTileDragOver(r, c, e) {
    if (!dragRef.current) return
    // Only allow drop on empty tiles
    if (r >= 0 && c >= 0 && grid[r][c] !== 'empty') return
    e.preventDefault()
    e.dataTransfer.dropEffect =
      dragRef.current.kind === 'tile' ? 'move' : 'copy'
    setDragHover([r, c])
  }

  function handleTileDragLeave(r, c) {
    setDragHover(prev => {
      if (!prev) return prev
      if (r === -1 && c === -1) return null
      return prev[0] === r && prev[1] === c ? null : prev
    })
  }

  function handleTileDrop(r, c, e) {
    e.preventDefault()
    const data = dragRef.current
    setDragHover(null)
    dragRef.current = null
    if (!data) return
    if (grid[r][c] !== 'empty') return
    if (data.kind === 'building') {
      placeBuildingAt(data.id, r, c)
    } else if (data.kind === 'tile') {
      const [fr, fc] = data.from
      moveBuilding(fr, fc, r, c)
    }
  }

  function handleDragEnd() {
    dragRef.current = null
    setDragHover(null)
  }

  return (
    <div className="app">
      <TopBar points={points} streak={streak} rank={rank} />
      <main className="layout">
        <section className="panel left-panel">
          <div className="challenges-header">
            <h2 className="panel-title">Challenges</h2>
            <ChallengeTimer />
          </div>
          <div className="challenges-scroll" aria-label="Challenge list">
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
          </div>
          <div className="evidence-composer">
            <EvidenceInput
              challenge={activeChallenge}
              onSubmit={handleSubmitEvidence}
              disabled={submitting}
            />
          </div>
          <EvidenceFeed log={log} />
        </section>
        <section className="panel right-panel">
          <h2 className="panel-title">Your Community</h2>
          <PixelGrid
            grid={grid}
            tool={tool}
            dragHover={dragHover}
            onTileClick={handleTileClick}
            onTileDragStart={handleTileDragStart}
            onTileDragOver={handleTileDragOver}
            onTileDragLeave={handleTileDragLeave}
            onTileDrop={handleTileDrop}
            onTileDragEnd={handleDragEnd}
          />
          <BuildMenu
            buildings={buildings}
            points={points}
            tool={tool}
            onSelectBuilding={selectBuildingTool}
            onToggleRemove={toggleRemoveTool}
            onCancel={clearTool}
            onBuildingDragStart={handleBuildingDragStart}
            onDragEnd={handleDragEnd}
          />
        </section>
      </main>
    </div>
  )
}

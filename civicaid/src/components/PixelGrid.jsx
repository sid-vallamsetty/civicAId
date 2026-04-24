import { buildingById } from '../data/buildings.js'

export default function PixelGrid({ grid }) {
  const cols = grid[0]?.length || 10
  return (
    <div
      className="pixel-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          if (cell === 'empty') {
            return <div key={`${r}-${c}`} className="tile tile-empty" />
          }
          const b = buildingById(cell)
          return (
            <div
              key={`${r}-${c}`}
              className="tile tile-filled"
              title={b?.label || cell}
              style={{ backgroundColor: b?.color || '#888' }}
            >
              {b?.sprite && (
                <img
                  src={b.sprite}
                  alt={b.label}
                  className="tile-sprite"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

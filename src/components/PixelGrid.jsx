import { buildingById } from '../data/buildings.js'

const TILE_PX = 52

export default function PixelGrid({
  grid,
  tool,
  dragHover,
  onTileClick,
  onTileDragStart,
  onTileDragOver,
  onTileDragLeave,
  onTileDrop,
  onTileDragEnd
}) {
  const cols = grid[0]?.length || 10
  const rows = grid.length || 8
  const toolType = tool?.type || 'none'

  return (
    <div
      className={`pixel-grid tool-${toolType}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${TILE_PX}px)`,
        gridTemplateRows: `repeat(${rows}, ${TILE_PX}px)`
      }}
      onDragLeave={e => {
        // Clear hover when leaving the grid entirely
        if (e.currentTarget === e.target) onTileDragLeave?.(-1, -1, e)
      }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const isEmpty = cell === 'empty'
          const b = isEmpty ? null : buildingById(cell)
          const isHover =
            dragHover && dragHover[0] === r && dragHover[1] === c
          const cls = [
            'tile',
            isEmpty ? 'tile-empty' : 'tile-filled',
            tool?.type === 'place' && isEmpty ? 'tile-placeable' : '',
            tool?.type === 'remove' && !isEmpty ? 'tile-removable' : '',
            isHover ? 'tile-drag-over' : ''
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={`${r}-${c}`}
              className={cls}
              title={
                isEmpty
                  ? tool?.type === 'place'
                    ? 'Click to place here'
                    : 'Empty plot'
                  : tool?.type === 'remove'
                  ? `Click to remove ${b?.label || ''}`
                  : `${b?.label || ''} — drag to move`
              }
              draggable={!isEmpty}
              onClick={() => onTileClick?.(r, c)}
              onDragStart={e => !isEmpty && onTileDragStart?.(r, c, e)}
              onDragOver={e => onTileDragOver?.(r, c, e)}
              onDragLeave={e => onTileDragLeave?.(r, c, e)}
              onDrop={e => onTileDrop?.(r, c, e)}
              onDragEnd={e => onTileDragEnd?.(r, c, e)}
            >
              {b?.sprite && (
                <img
                  src={b.sprite}
                  alt={b.label}
                  className="tile-sprite"
                  draggable={false}
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default function BuildMenu({
  buildings,
  points,
  tool,
  onSelectBuilding,
  onToggleRemove,
  onCancel,
  onBuildingDragStart,
  onDragEnd
}) {
  const selectedBuilding =
    tool?.type === 'place'
      ? buildings.find(b => b.id === tool.buildingId)
      : null

  return (
    <div className="build-menu">
      <div className="build-menu-head">
        <h3 className="build-menu-title">Build Menu</h3>
        <ToolStatus
          tool={tool}
          selectedBuilding={selectedBuilding}
          onCancel={onCancel}
        />
      </div>

      <div className="build-grid">
        {buildings.map(b => {
          const affordable = points >= b.cost
          const selected =
            tool?.type === 'place' && tool.buildingId === b.id
          return (
            <button
              key={b.id}
              type="button"
              className={`build-card ${selected ? 'selected' : ''} ${
                !affordable ? 'unaffordable' : ''
              }`}
              draggable={affordable}
              disabled={!affordable}
              onClick={() => affordable && onSelectBuilding(b.id)}
              onDragStart={e => affordable && onBuildingDragStart(b.id, e)}
              onDragEnd={onDragEnd}
              title={
                affordable
                  ? `Click to select, or drag onto the grid`
                  : `Need ${b.cost - points} more pts`
              }
            >
              <div
                className="build-card-icon"
                style={{ backgroundColor: b.color }}
              >
                {b.sprite && (
                  <img
                    src={b.sprite}
                    alt=""
                    draggable={false}
                    onError={e => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
              <span className="build-card-label">{b.label}</span>
              <span className="build-card-cost">{b.cost} pts</span>
            </button>
          )
        })}
      </div>

      <div className="build-actions">
        <button
          type="button"
          className={`build-action-btn remove-btn ${
            tool?.type === 'remove' ? 'active' : ''
          }`}
          onClick={onToggleRemove}
          title="Click placed buildings to remove them (50% refund)"
        >
          {tool?.type === 'remove' ? '✕ Removing — click to stop' : '✕ Remove Mode'}
        </button>
      </div>

      <p className="build-hint">
        Tip: drag cards onto the grid, or drag placed buildings to move them.
      </p>
    </div>
  )
}

function ToolStatus({ tool, selectedBuilding, onCancel }) {
  if (!tool) {
    return (
      <span className="tool-status idle">Pick a building or drag to place</span>
    )
  }
  if (tool.type === 'place') {
    return (
      <span className="tool-status active">
        Placing: <strong>{selectedBuilding?.label || tool.buildingId}</strong>
        <button type="button" onClick={onCancel} className="tool-cancel">
          cancel
        </button>
      </span>
    )
  }
  if (tool.type === 'remove') {
    return (
      <span className="tool-status active remove">
        Remove mode
        <button type="button" onClick={onCancel} className="tool-cancel">
          cancel
        </button>
      </span>
    )
  }
  return null
}

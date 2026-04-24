export default function EvidenceFeed({ log }) {
  if (!log.length) {
    return (
      <div className="feed empty">
        <p className="feed-empty">No submissions yet. Pick a challenge in the list and tell Claude what you did!</p>
      </div>
    )
  }
  return (
    <div className="feed">
      <h3 className="feed-title">Claude's Responses</h3>
      <ul className="feed-list">
        {log.map(entry => (
          <li key={entry.id} className={`feed-item status-${entry.status}`}>
            <div className="feed-item-head">
              <span className="feed-challenge">{entry.challengeTitle}</span>
              <span className={`feed-status status-${entry.status}`}>
                {entry.status === 'pending' && 'reviewing'}
                {entry.status === 'approved' && (entry.pointsAwarded >= 0 ? `+${entry.pointsAwarded}` : `${entry.pointsAwarded}`)}
                {entry.status === 'rejected' && 'denied'}
                {entry.status === 'error' && 'error'}
              </span>
            </div>
            {entry.evidence && (
              <p className="feed-evidence">"{entry.evidence}"</p>
            )}
            {entry.file && (
              <div className="feed-file">
                {entry.file.previewUrl ? (
                  <img
                    src={entry.file.previewUrl}
                    alt={entry.file.name}
                    className="feed-thumb"
                  />
                ) : (
                  <span className="feed-pdf">📄 {entry.file.name}</span>
                )}
              </div>
            )}
            <p className="feed-message">{entry.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

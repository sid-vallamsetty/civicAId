const ANTHRO_SPRITE = '/sprites/anthro.png'

function statusBadgeText(entry) {
  switch (entry.status) {
    case 'pending':  return 'reviewing'
    case 'approved': return entry.pointsAwarded >= 0 ? `+${entry.pointsAwarded}` : `${entry.pointsAwarded}`
    case 'rejected': return 'denied'
    case 'error':    return 'error'
    default:         return ''
  }
}

function statusGreeting(status) {
  switch (status) {
    case 'pending':  return 'Hmm, let me take a look...'
    case 'approved': return 'Nice work, neighbor!'
    case 'rejected': return "I can't approve this one."
    case 'error':    return 'Something went wrong on my end.'
    default:         return ''
  }
}

function AnthroAvatar({ status, size = 56 }) {
  return (
    <div
      className={`anthro-avatar status-${status || 'idle'}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src={ANTHRO_SPRITE} alt="" className="anthro-avatar-img" />
      {status && status !== 'idle' && (
        <span className={`anthro-status-dot status-${status}`} />
      )}
    </div>
  )
}

export default function EvidenceFeed({ log }) {
  if (!log.length) {
    return (
      <div className="feed empty anthro-empty">
        <AnthroAvatar size={72} />
        <div className="anthro-bubble anthro-bubble-intro">
          <p className="anthro-name">Anthro</p>
          <p className="feed-empty">
            Hi, I'm <strong>Anthro</strong>! Pick a challenge and tell me what
            you did — I'll review your evidence and award points.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="feed">
      <h3 className="feed-title">
        <AnthroAvatar size={28} />
        <span>Anthro's Responses</span>
      </h3>
      <ul className="feed-list">
        {log.map(entry => (
          <li key={entry.id} className={`feed-item status-${entry.status}`}>
            <AnthroAvatar status={entry.status} />
            <div className="anthro-bubble">
              <div className="feed-item-head">
                <div className="feed-item-meta">
                  <span className="anthro-name">Anthro</span>
                  <span className="feed-challenge">{entry.challengeTitle}</span>
                </div>
                <span className={`feed-status status-${entry.status}`}>
                  {statusBadgeText(entry)}
                </span>
              </div>

              <p className="anthro-greeting">{statusGreeting(entry.status)}</p>

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
                    <span className="feed-pdf">{entry.file.name}</span>
                  )}
                </div>
              )}
              <p className="feed-message">{entry.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

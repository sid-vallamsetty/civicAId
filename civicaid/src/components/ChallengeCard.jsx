export default function ChallengeCard({ challenge, active, onSelect }) {
  return (
    <button
      type="button"
      className={`challenge-card tier-${challenge.tier} ${active ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="challenge-head">
        <span className={`tier-pill tier-${challenge.tier}`}>{challenge.tier}</span>
        <span className="points-pill">+{challenge.points}</span>
      </div>
      <h3 className="challenge-title">{challenge.title}</h3>
      <p className="challenge-desc">{challenge.description}</p>
    </button>
  )
}

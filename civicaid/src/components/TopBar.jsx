import { PixelFire, RankIcon } from './PixelIcons.jsx'

export default function TopBar({ points, streak, rank }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">civic</span><span className="brand-mark accent">AId</span>
      </div>
      <div className="stats">
        <div className="stat rank-badge">
          <span className="stat-label">Rank</span>
          <span className="stat-value rank-value">
            <RankIcon rank={rank.label} size={22} className="rank-icon" />
            <span className="rank-text">{rank.label}</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Points</span>
          <span className="stat-value">{points}</span>
        </div>
        <div className="stat streak-stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value streak-value">
            <PixelFire size={40} className="streak-fire" />
            <span className="streak-number">{streak}</span>
          </span>
        </div>
      </div>
    </header>
  )
}

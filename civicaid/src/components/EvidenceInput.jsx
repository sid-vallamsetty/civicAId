import { useState } from 'react'

export default function EvidenceInput({ challenge, onSubmit, disabled }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit(text)
    setText('')
  }

  return (
    <form className="evidence-input" onSubmit={handleSubmit}>
      <label className="evidence-label">
        Evidence for: <strong>{challenge.title}</strong>
      </label>
      <textarea
        className="evidence-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Describe what you did. Claude will review and award points..."
        rows={2}
        disabled={disabled}
      />
      <button type="submit" className="evidence-submit" disabled={disabled || !text.trim()}>
        {disabled ? 'Reviewing...' : 'Submit Evidence'}
      </button>
    </form>
  )
}

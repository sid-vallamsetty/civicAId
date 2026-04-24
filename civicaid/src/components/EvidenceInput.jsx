import { useRef, useState } from 'react'
import { isImage, readFileAsDataURL, validateFile } from '../utils/fileUtils.js'

export default function EvidenceInput({ challenge, onSubmit, disabled }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileError, setFileError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    setFileError(null)
    const f = e.target.files?.[0]
    if (!f) {
      setFile(null)
      setPreviewUrl(null)
      return
    }
    const err = validateFile(f)
    if (err) {
      setFileError(err)
      e.target.value = ''
      setFile(null)
      setPreviewUrl(null)
      return
    }
    setFile(f)
    if (isImage(f)) {
      try {
        setPreviewUrl(await readFileAsDataURL(f))
      } catch {
        setPreviewUrl(null)
      }
    } else {
      setPreviewUrl(null)
    }
  }

  function clearFile() {
    setFile(null)
    setPreviewUrl(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (disabled) return
    if (!text.trim() && !file) return
    onSubmit(text, file, previewUrl)
    setText('')
    clearFile()
  }

  const canSubmit = !disabled && (text.trim().length > 0 || !!file)

  return (
    <form className="evidence-input" onSubmit={handleSubmit}>
      <label className="evidence-label">
        Evidence for: <strong>{challenge.title}</strong>
      </label>
      <textarea
        className="evidence-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Describe what you did, attach a photo or PDF, or both..."
        rows={2}
        disabled={disabled}
      />
      <div className="evidence-file-row">
        <label className="evidence-file-label">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            disabled={disabled}
            className="evidence-file-input"
          />
          <span className="evidence-file-button">
            {file ? 'Replace file' : 'Attach image or PDF'}
          </span>
        </label>
        {file && (
          <div className="evidence-file-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="evidence-thumb" />
            ) : (
              <span className="evidence-pdf">📄 {file.name}</span>
            )}
            <button
              type="button"
              onClick={clearFile}
              className="evidence-clear"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      {fileError && <div className="evidence-file-error">{fileError}</div>}
      <button type="submit" className="evidence-submit" disabled={!canSubmit}>
        {disabled ? 'Reviewing...' : 'Submit Evidence'}
      </button>
    </form>
  )
}

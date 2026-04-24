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
      <header className="evidence-header">
        <span className="evidence-header-marker">▸ Evidence</span>
        <span className="evidence-header-target" title={challenge.title}>
          {challenge.title}
        </span>
      </header>

      <div className="evidence-body">
        <textarea
          className="evidence-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe what you did — add a photo or PDF for bonus credibility."
          rows={2}
          disabled={disabled}
        />

        {file && (
          <div className="evidence-file-chip">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="evidence-thumb" />
            ) : (
              <span className="evidence-pdf-badge" aria-hidden="true">PDF</span>
            )}
            <span className="evidence-file-name" title={file.name}>
              {file.name}
            </span>
            <button
              type="button"
              onClick={clearFile}
              className="evidence-chip-clear"
              disabled={disabled}
              aria-label="Remove file"
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {fileError && <div className="evidence-file-error">{fileError}</div>}

        <div className="evidence-toolbar">
          <label className="evidence-attach">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={disabled}
              className="evidence-file-input"
            />
            <span className="evidence-attach-btn">
              <span className="evidence-attach-icon" aria-hidden="true">+</span>
              <span>{file ? 'Replace' : 'Attach'}</span>
            </span>
          </label>

          <button
            type="submit"
            className="evidence-submit"
            disabled={!canSubmit}
          >
            {disabled ? 'Reviewing...' : 'Submit Evidence'}
          </button>
        </div>
      </div>
    </form>
  )
}

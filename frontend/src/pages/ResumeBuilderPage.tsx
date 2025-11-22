import React, { useState } from 'react'

const ResumeBuilderPage: React.FC = () => {
  const [title, setTitle] = useState('Software Engineer Resume')
  const [summary, setSummary] = useState('Passionate engineer who loves building helpful tools.')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Wire this up to the backend later
    console.log({ title, summary })
  }

  return (
    <section className="page">
      <h2>Resume Builder</h2>
      <form className="simple-form" onSubmit={handleSubmit}>
        <label>
          Resume title
          <input
            type="text"
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
        </label>
        <label>
          Summary
          <textarea
            value={summary}
            onChange={event => setSummary(event.target.value)}
            rows={4}
          />
        </label>
        <button type="submit">Save draft</button>
      </form>
    </section>
  )
}

export default ResumeBuilderPage

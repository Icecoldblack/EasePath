import React from 'react'
import ResumePreview from '../components/ResumePreview'

const HomePage: React.FC = () => {
  return (
    <section className="page page-home">
      <div className="page-header">
        <h1>E-Resume</h1>
        <p>Create, edit, and track resumes tailored to each job you apply for.</p>
      </div>
      <ResumePreview />
    </section>
  )
}

export default HomePage

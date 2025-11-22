import React from 'react'

const LoginPage: React.FC = () => {
  return (
    <section className="page">
      <h2>Login</h2>
      <form className="simple-form">
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="●●●●●●●●" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </section>
  )
}

export default LoginPage

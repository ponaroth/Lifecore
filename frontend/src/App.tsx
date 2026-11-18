import { useEffect, useState } from 'react'
import { fetchBackendStatus, type BackendStatus } from './api/health'
import './index.css'

const modules = [
  { name: 'Policies', description: 'Find policies, view beneficiaries and status.', phase: 1 },
  { name: 'Beneficiary changes', description: 'Submit, review and approve change requests.', phase: 1 },
  { name: 'Documents', description: 'Signed PDFs in private storage, with versions.', phase: 1 },
  { name: 'Audit history', description: 'Who changed what, and when.', phase: 1 },
  { name: 'Annuities', description: 'Contributions, credited interest and withdrawals.', phase: 3 },
]

export default function App() {
  const [status, setStatus] = useState<BackendStatus>('UNKNOWN')

  useEffect(() => {
    const controller = new AbortController()
    fetchBackendStatus(controller.signal).then(setStatus)
    return () => controller.abort()
  }, [])

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">LifeCore</span>
        <span className={`status status-${status.toLowerCase()}`} role="status">
          Backend: {status}
        </span>
      </header>
      <main>
        <h1>Policy administration</h1>
        <p className="lede">
          A portfolio demo for agents and operations reviewers. All customers and documents are
          fictional.
        </p>
        <ul className="modules">
          {modules.map((m) => (
            <li key={m.name} className="module">
              <h2>{m.name}</h2>
              <p>{m.description}</p>
              <span className="phase">Phase {m.phase}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

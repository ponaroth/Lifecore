import { useEffect, useState } from 'react'
import { fetchServiceStatus, services, type ServiceId, type ServiceStatus } from './api/health'
import './index.css'

const modules = [
  { name: 'Policies', description: 'Find policies, view beneficiaries and status.', phase: 2 },
  { name: 'Beneficiary changes', description: 'Submit, review and approve change requests.', phase: 3 },
  { name: 'Documents', description: 'Signed PDFs in private storage, with versions.', phase: 3 },
  { name: 'Audit history', description: 'Who changed what, and when.', phase: 2 },
  { name: 'Annuities', description: 'Contributions, credited interest and withdrawals.', phase: 4 },
]

export default function App() {
  const [status, setStatus] = useState<Partial<Record<ServiceId, ServiceStatus>>>({})

  useEffect(() => {
    const controller = new AbortController()
    for (const { id } of services) {
      fetchServiceStatus(id, controller.signal).then((s) =>
        setStatus((prev) => ({ ...prev, [id]: s })),
      )
    }
    return () => controller.abort()
  }, [])

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">LifeCore</span>
        <ul className="statuses" aria-label="Service health">
          {services.map(({ id, name }) => {
            const s = status[id] ?? 'UNKNOWN'
            return (
              <li key={id} className={`status status-${s.toLowerCase()}`}>
                {name}: {s}
              </li>
            )
          })}
        </ul>
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

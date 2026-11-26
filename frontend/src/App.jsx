import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Check,
  Clock3,
  Copy,
  Database,
  History,
  LayoutDashboard,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  WandSparkles,
  Wrench,
  Zap,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

const agentCards = [
  { icon: Search, number: '01', name: 'Planner Agent', text: 'Decomposes your task and identifies goals and constraints.' },
  { icon: Wrench, number: '02', name: 'Tool Selection', text: 'Chooses safe, allowlisted tools for the workflow.' },
  { icon: WandSparkles, number: '03', name: 'Prompt Architect', text: 'Creates three distinct prompt strategies.' },
  { icon: Bot, number: '04', name: 'Execution Agents', text: 'Generates candidate answers concurrently.' },
  { icon: Trophy, number: '05', name: 'Critic Agent', text: 'Scores every answer on five quality criteria.' },
  { icon: ShieldCheck, number: '06', name: 'Verification', text: 'Checks relevance, consistency and safety.' },
]

function App() {
  const [task, setTask] = useState('')
  const [activePage, setActivePage] = useState('workspace')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/history`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setHistory(data.runs || []))
      .catch(() => setHistory([]))
  }, [])

  async function runWorkflow(event) {
    event.preventDefault()
    if (task.trim().length < 5) {
      setError('Enter a task with at least 5 characters.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`${API_URL}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Workflow failed.')
      setResult(data)

      const historyResponse = await fetch(`${API_URL}/api/history`)
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistory(historyData.runs || [])
      }
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  async function copyAnswer() {
    if (!result?.final_answer) return
    await navigator.clipboard.writeText(result.final_answer)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const winningScore = Number(result?.final_score || 0)
  const verificationStatus = result?.verification?.status || 'PENDING'
  const verificationPassed = verificationStatus === 'PASS'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={20} /></div>
          <div><b>PROMPTFORGE</b><small>AI ORCHESTRATOR</small></div>
        </div>

        <span className="side-label">WORKSPACE</span>
        <button className={`nav ${activePage === 'workspace' ? 'active' : ''}`} onClick={() => setActivePage('workspace')}>
          <LayoutDashboard size={15} /> Workspace
        </button>
        <button className={`nav ${activePage === 'history' ? 'active' : ''}`} onClick={() => setActivePage('history')}>
          <History size={15} /> Run History
        </button>

        <span className="side-label agents-label">ACTIVE AGENTS</span>
        {agentCards.slice(0, 5).map((agent) => {
          const Icon = agent.icon
          return (
            <div className="agent-mini" key={agent.name}>
              <Icon size={14} />
              <div><b>{agent.name}</b><small>Ready</small></div>
            </div>
          )
        })}

        <div className="sidebar-bottom"><span className="online-dot" /> System online <span>v2.0</span></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">INTELLIGENCE LAYER</span><h1>{activePage === 'workspace' ? 'Agent Workspace' : 'Run History'}</h1></div>
          <div className="top-status"><span className="online-dot" /> SYSTEM READY <span className="model-tag">GEMINI</span></div>
        </header>

        {activePage === 'workspace' ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="pill"><Zap size={11} /> MULTI-AGENT ENGINE</div>
                <h2>Transform prompts into <span>high-performance results.</span></h2>
                <p>Orchestrate planning, execution, critique and verification through a controlled agent workflow.</p>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="orbit" /><div className="orbit orbit-two" />
                <div className="core"><Sparkles size={30} /></div>
                <div className="node n1"><Search /></div>
                <div className="node n2"><Wrench /></div>
                <div className="node n3"><ShieldCheck /></div>
              </div>
            </section>

            <section>
              <div className="section-heading">
                <div><span className="eyebrow">NEW EXECUTION</span><h3>What would you like to accomplish?</h3></div>
                <span className="secure"><ShieldCheck size={12} /> SECURE WORKFLOW</span>
              </div>

              <form className="task-card" onSubmit={runWorkflow}>
                <label htmlFor="task">TASK DESCRIPTION</label>
                <textarea
                  id="task"
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  placeholder="Describe the outcome you need..."
                  maxLength={5000}
                />
                <div className="input-footer">
                  <span>{task.length} / 5000 characters</span>
                  <span>Agent workflow will run locally</span>
                </div>
                {error && <div className="error">{error}</div>}
                <button className="primary-btn" type="submit" disabled={loading || task.trim().length < 5}>
                  {loading ? <Loader2 className="spin" size={15} /> : <ArrowRight size={15} />}
                  {loading ? 'Running agents...' : 'Run Agent Workflow'}
                </button>
              </form>
            </section>

            {loading && (
              <div className="loading-panel">
                <Loader2 className="spin" size={20} />
                <div><b>Orchestrating agent workflow</b><p>Planning, evaluating and refining your result.</p></div>
              </div>
            )}

            <section>
              <div className="section-heading agents-heading">
                <div><span className="eyebrow">ORCHESTRATION</span><h3>Agent Pipeline</h3></div>
                <span className="agent-count">6 ACTIVE AGENTS</span>
              </div>
              <div className="agent-grid">
                {agentCards.map((agent) => {
                  const Icon = agent.icon
                  return (
                    <article className="agent-card" key={agent.name}>
                      <div className="agent-icon"><Icon size={17} /></div>
                      <span className="agent-number">AGENT {agent.number}</span>
                      <b>{agent.name}</b>
                      <p>{agent.text}</p>
                    </article>
                  )
                })}
              </div>
            </section>

            {result && (
              <section className="results">
                <div className="result-title">
                  <div><span className="eyebrow">OUTPUT</span><h3>Execution Result</h3></div>
                  <span className="winner-badge"><Trophy size={12} /> WINNER: {result.winner}</span>
                </div>

                <div className="metric-row">
                  <div className="metric"><small>WINNING SCORE</small><strong>{winningScore.toFixed(1)} <em>/ 10</em></strong></div>
                  <div className="metric"><small>EXECUTION TIME</small><strong>{((result.duration_ms || 0) / 1000).toFixed(1)} <em>sec</em></strong></div>
                  <div className="metric"><small>VERIFICATION</small><strong className="verify-text">{verificationPassed ? 'PASS' : 'REVIEW'}</strong></div>
                </div>

                <div className="score-list">
                  {(result.candidates || []).map((candidate, index) => {
                    const evaluation = candidate.evaluation || {}
                    const score = Number(evaluation.total || 0)
                    return (
                      <article className="score-card" key={`${candidate.strategy}-${index}`}>
                        <div className="score-head"><span>Candidate {index + 1}</span><strong>{score.toFixed(1)}</strong></div>
                        <b>{candidate.strategy}</b>
                        <div className="bar"><span style={{ width: `${Math.min(score * 10, 100)}%` }} /></div>
                        <p>{evaluation.feedback || 'No feedback returned.'}</p>
                      </article>
                    )
                  })}
                </div>

                <div className="final-answer">
                  <div className="answer-head">
                    <div><Terminal size={13} /> FINAL ANSWER</div>
                    <button className="copy-btn" onClick={copyAnswer}><Copy size={11} /> {copied ? 'Copied' : 'Copy'}</button>
                  </div>
                  <pre>{result.final_answer}</pre>
                </div>

                <div className="verify-box">
                  {verificationPassed ? <Check size={18} /> : <ShieldCheck size={18} />}
                  <div><b>{verificationPassed ? 'Verification passed' : 'Manual review recommended'}</b><p>{result.verification?.note || 'No verification note returned.'}</p></div>
                </div>

                <details className="candidate-details">
                  <summary>Execution trace</summary>
                  <div className="trace-list">
                    {(result.trace || []).map((item, index) => (
                      <div className="trace-item" key={`${item.agent}-${index}`}>
                        <span className={`trace-dot ${item.status === 'completed' ? 'done' : item.status === 'blocked' || item.status === 'rejected' ? 'warn' : ''}`} />
                        <div><b>{item.agent}</b><small>{item.status} · {item.duration_ms || 0} ms</small><p>{item.detail}</p></div>
                      </div>
                    ))}
                  </div>
                </details>
              </section>
            )}
          </>
        ) : (
          <section className="history-section">
            <h3>Previous executions</h3>
            {history.length ? history.map((run) => (
              <article className="history-card" key={run.id}>
                <div><b>{run.task}</b><small><Clock3 size={11} /> {new Date(run.created_at).toLocaleString()} · {run.winner}</small></div>
                <strong>{Number(run.final_score || 0).toFixed(1)} / 10</strong>
              </article>
            )) : (
              <div className="empty"><Database size={25} /><b>No runs yet</b><p>Completed workflows will appear here.</p></div>
            )}
          </section>
        )}

        <footer><span>PROMPTFORGE AI</span><span>Advanced Agent Orchestrator</span></footer>
      </main>
    </div>
  )
}

export default App
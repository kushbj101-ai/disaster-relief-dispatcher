import React, { useState, useEffect } from 'react';

const RESOURCE_ICONS = {
  WATER: '💧',
  MEDICAL: '🩹',
  FOOD: '🥫',
  SHELTER_BLANKETS: '⛺'
};

export default function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campName: '',
    region: '',
    resourceType: 'WATER',
    quantityNeeded: '',
    peopleAffected: ''
  });

  const loadData = () => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const dispatchTruck = async (id) => {
    setLoading(true);
    try {
      await fetch(`/api/requests/dispatch/${id}`, { method: 'PATCH' });
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ campName: '', region: '', resourceType: 'WATER', quantityNeeded: '', peopleAffected: '' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalImpacted = requests.reduce((acc, r) => acc + (r.peopleAffected || 0), 0);
  const criticalCount = requests.filter(r => r.urgencyScore >= 1500).length;

  return (
    <div className="shell">
      {/* Top Navbar */}
      <nav className="top-nav">
        <div className="nav-brand">
          <div className="radar-ping">
            <span className="ping-beacon"></span>
            <span className="ping-dot"></span>
          </div>
          <div>
            <h1>AegisRelief</h1>
            <span className="nav-tagline">Autonomous Disaster Dispatch Network</span>
          </div>
        </div>
        <div className="system-status">
          <span className="status-indicator"></span>
          <span>DISPATCH ENGINE ACTIVE</span>
        </div>
      </nav>

      <main className="content-container">
        {/* KPI Telemetry Banner */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-title">Active Requests</span>
            <span className="kpi-value">{requests.length}</span>
            <span className="kpi-subtext">Open camp deficits</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Critical Urgency</span>
            <span className="kpi-value warning">{criticalCount}</span>
            <span className="kpi-subtext">Score &gt; 1500 threshold</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Population at Risk</span>
            <span className="kpi-value">{totalImpacted.toLocaleString()}</span>
            <span className="kpi-subtext">Cumulative individuals</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Network Response</span>
            <span className="kpi-value accent">Ready</span>
            <span className="kpi-subtext">Convoy fleet standby</span>
          </div>
        </section>

        {/* Action Panel Grid */}
        <div className="workspace-grid">
          {/* Dispatch Registration Form */}
          <section className="panel-card form-panel">
            <div className="panel-header">
              <h3>Log Urgent Camp Deficit</h3>
              <p>Broadcast high-priority needs across relief chains</p>
            </div>
            
            <form onSubmit={submitRequest}>
              <div className="input-group">
                <label>Camp Identifier</label>
                <input 
                  placeholder="e.g., Sector 7 Delta Shelter" 
                  value={form.campName} 
                  onChange={e => setForm({...form, campName: e.target.value})} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Region & Coordinates</label>
                <input 
                  placeholder="e.g., Coastal Highway KM 14" 
                  value={form.region} 
                  onChange={e => setForm({...form, region: e.target.value})} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Requested Critical Supply</label>
                <select 
                  value={form.resourceType} 
                  onChange={e => setForm({...form, resourceType: e.target.value})}
                >
                  <option value="WATER">💧 Potable Drinking Water (Liters)</option>
                  <option value="MEDICAL">🩹 Medical Trauma Kits</option>
                  <option value="FOOD">🥫 MRE Rations & Food Packs</option>
                  <option value="SHELTER_BLANKETS">⛺ Thermal Blankets & Tents</option>
                </select>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Quantity Required</label>
                  <input 
                    type="number" 
                    placeholder="Units / Liters" 
                    value={form.quantityNeeded} 
                    onChange={e => setForm({...form, quantityNeeded: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Impacted People</label>
                  <input 
                    type="number" 
                    placeholder="Headcount" 
                    value={form.peopleAffected} 
                    onChange={e => setForm({...form, peopleAffected: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-dispatch-submit">
                {loading ? 'Transmitting...' : 'Transmit Deficit Alert'}
              </button>
            </form>
          </section>

          {/* Real-time Triage Priority Queue */}
          <section className="panel-card table-panel">
            <div className="panel-header">
              <div className="flex-between">
                <div>
                  <h3>Autonomous Triage Matrix</h3>
                  <p>Queued dynamically by weighted algorithmic urgency</p>
                </div>
                <button onClick={loadData} className="btn-refresh">↻ Refresh</button>
              </div>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Priority Score</th>
                    <th>Camp Location</th>
                    <th>Resource Type</th>
                    <th>Quantity</th>
                    <th>Convoy Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id} className={r.urgencyScore >= 1500 ? 'row-critical' : ''}>
                      <td>
                        <div className={`score-badge ${r.urgencyScore >= 1500 ? 'critical' : 'stable'}`}>
                          <span>⚡ {r.urgencyScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className="camp-title">{r.campName}</div>
                        <div className="camp-region">{r.region} • {r.peopleAffected} people</div>
                      </td>
                      <td>
                        <span className="resource-pill">
                          {RESOURCE_ICONS[r.resourceType] || '📦'} {r.resourceType}
                        </span>
                      </td>
                      <td className="quantity-cell">
                        <strong>{r.quantityNeeded.toLocaleString()}</strong>
                      </td>
                      <td>
                        <button 
                          className="btn-action-dispatch" 
                          onClick={() => dispatchTruck(r._id)}
                          disabled={loading}
                        >
                          Dispatch Convoy
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <span className="empty-icon">🛡️</span>
                          <h4>All Sectors Stable</h4>
                          <p>No unfulfilled emergency camp alerts logged in the operational database.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
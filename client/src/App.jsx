import React, { useState, useEffect } from 'react';

const SUPPLY_METADATA = {
  WATER: { label: 'Potable Water', unit: 'Liters', icon: '💧', tint: 'tint-cyan' },
  MEDICAL: { label: 'Trauma Packs', unit: 'Kits', icon: '🩹', tint: 'tint-rose' },
  FOOD: { label: 'MRE Rations', unit: 'Meals', icon: '🥫', tint: 'tint-amber' },
  SHELTER_BLANKETS: { label: 'Thermal Blankets', unit: 'Bundles', icon: '⛺', tint: 'tint-emerald' }
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
    const timer = setInterval(loadData, 8000);
    return () => clearInterval(timer);
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

  const totalPeople = requests.reduce((acc, r) => acc + (Number(r.peopleAffected) || 0), 0);
  const highPriorityTotal = requests.filter(r => r.urgencyScore >= 1000).length;

  return (
    <div className="layout-root">
      {/* Precision Command Header */}
      <header className="header-bar">
        <div className="brand-group">
          <div className="beacon-indicator">
            <span className="beacon-ring"></span>
            <span className="beacon-core"></span>
          </div>
          <div>
            <div className="brand-title">AEGIS<span className="brand-highlight">RELIEF</span></div>
            <div className="brand-subtitle">Automated Triage & Emergency Logistics Engine</div>
          </div>
        </div>

        <div className="header-meta">
          <div className="telemetry-pill">
            <span className="live-dot"></span>
            <span className="telemetry-label">DISPATCH HUB: LIVE</span>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Metric Telemetry Cards */}
        <section className="metric-deck">
          <div className="metric-card">
            <div className="metric-header">Active Deficits</div>
            <div className="metric-data-row">
              <span className="metric-number">{requests.length}</span>
              <span className="metric-trend neutral">ACTIVE</span>
            </div>
            <div className="metric-caption">Awaiting relief convoy triage</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">Critical Urgency (&gt; 1,000)</div>
            <div className="metric-data-row">
              <span className="metric-number alert">{highPriorityTotal}</span>
              <span className="metric-trend danger">HIGH</span>
            </div>
            <div className="metric-caption">Elevated life-safety index</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">Population Exposed</div>
            <div className="metric-data-row">
              <span className="metric-number">{totalPeople.toLocaleString()}</span>
              <span className="metric-trend neutral">SOULS</span>
            </div>
            <div className="metric-caption">Directly impacted survivors</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">Automated Routing</div>
            <div className="metric-data-row">
              <span className="metric-number success">Online</span>
              <span className="metric-trend success">NOMINAL</span>
            </div>
            <div className="metric-caption">Dispatch engine operational</div>
          </div>
        </section>

        {/* Primary Operational Workspace */}
        <div className="operation-grid">
          {/* Deficit Logging Form */}
          <section className="surface-card">
            <div className="surface-header">
              <div className="surface-title">Record Emergency Requisition</div>
              <div className="surface-subtitle">Log verified field deficit to calculate algorithmic urgency</div>
            </div>

            <form onSubmit={submitRequest} className="operation-form">
              <div className="field-group">
                <label>Camp / Outpost Name</label>
                <input
                  type="text"
                  placeholder="e.g. Outpost Delta Seven"
                  value={form.campName}
                  onChange={e => setForm({ ...form, campName: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label>Target Sector & Grid Coordinates</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4 • Waypoint Bravo"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label>Supply Category</label>
                <select
                  value={form.resourceType}
                  onChange={e => setForm({ ...form, resourceType: e.target.value })}
                >
                  <option value="WATER">💧 Potable Drinking Water (Liters)</option>
                  <option value="MEDICAL">🩹 Medical Trauma Kits</option>
                  <option value="FOOD">🥫 MRE Rations & Meal Packs</option>
                  <option value="SHELTER_BLANKETS">⛺ Thermal Blankets & Shelters</option>
                </select>
              </div>

              <div className="field-split">
                <div className="field-group">
                  <label>Deficit Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Units needed"
                    value={form.quantityNeeded}
                    onChange={e => setForm({ ...form, quantityNeeded: e.target.value })}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Impacted Individuals</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Headcount"
                    value={form.peopleAffected}
                    onChange={e => setForm({ ...form, peopleAffected: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Transmitting Alert...' : 'Publish Deficit to Grid'}
              </button>
            </form>
          </section>

          {/* Priority Triage Ledger */}
          <section className="surface-card">
            <div className="surface-header flex-between">
              <div>
                <div className="surface-title">Urgency Triage Ledger</div>
                <div className="surface-subtitle">Prioritized dynamically by weighted severity algorithms</div>
              </div>
              <button className="sync-btn" onClick={loadData}>↻ Resync</button>
            </div>

            <div className="table-wrapper">
              <table className="priority-table">
                <thead>
                  <tr>
                    <th>Urgency Score</th>
                    <th>Camp Location</th>
                    <th>Resource Requested</th>
                    <th>Deficit Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(item => {
                    const supply = SUPPLY_METADATA[item.resourceType] || {
                      label: item.resourceType,
                      unit: 'Units',
                      icon: '📦',
                      tint: 'tint-slate'
                    };
                    const isUrgent = item.urgencyScore >= 1000;

                    return (
                      <tr key={item._id} className={isUrgent ? 'row-urgent' : ''}>
                        <td>
                          <span className={`urgency-tag ${isUrgent ? 'urgent' : 'standard'}`}>
                            {item.urgencyScore}
                          </span>
                        </td>
                        <td>
                          <div className="entity-name">{item.campName}</div>
                          <div className="entity-sub">{item.region} • {item.peopleAffected} souls</div>
                        </td>
                        <td>
                          <span className={`category-pill ${supply.tint}`}>
                            <span>{supply.icon}</span>
                            <span>{supply.label}</span>
                          </span>
                        </td>
                        <td className="mono-stat">
                          <strong>{item.quantityNeeded.toLocaleString()}</strong>
                          <span className="mono-unit">{supply.unit}</span>
                        </td>
                        <td>
                          <button
                            className="dispatch-action-btn"
                            onClick={() => dispatchTruck(item._id)}
                            disabled={loading}
                          >
                            Dispatch Truck
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state-cell">
                        <div className="empty-state">
                          <div className="empty-icon">🛡️</div>
                          <div className="empty-title">Logistics Ledger Clear</div>
                          <div className="empty-desc">All registered emergency camp requisitions have been fulfilled and dispatched.</div>
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
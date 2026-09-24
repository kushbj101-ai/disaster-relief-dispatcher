import React, { useState, useEffect } from 'react';

const SUPPLY_CONFIG = {
  WATER: { label: 'Clean Drinking Water', unit: 'Liters', icon: '💧', badgeClass: 'badge-teal' },
  MEDICAL: { label: 'Emergency First Aid', unit: 'Kits', icon: '🩺', badgeClass: 'badge-coral' },
  FOOD: { label: 'Essential Food Rations', unit: 'Meals', icon: '🍞', badgeClass: 'badge-amber' },
  SHELTER_BLANKETS: { label: 'Blankets & Tents', unit: 'Bundles', icon: '⛺', badgeClass: 'badge-sage' }
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
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
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

  const totalAffected = requests.reduce((acc, r) => acc + (Number(r.peopleAffected) || 0), 0);
  const urgentCount = requests.filter(r => r.urgencyScore >= 1000).length;

  return (
    <div className="app-shell">
      {/* Soft Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <span className="pulse-dot"></span>
            </div>
            <div>
              <h1 className="brand-name">ResQ<span>Net</span></h1>
              <p className="brand-tagline">Humanitarian Relief Dispatch & Coordination</p>
            </div>
          </div>
          <div className="header-status">
            <span className="network-pill">
              <span className="network-dot"></span>
              Live Sync Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-container">
        {/* Metric Cards */}
        <section className="stats-row">
          <div className="stat-card">
            <span className="stat-title">Pending Requests</span>
            <div className="stat-value-group">
              <span className="stat-number">{requests.length}</span>
              <span className="stat-chip chip-slate">Open</span>
            </div>
            <p className="stat-sub">Relief deliveries awaiting assignment</p>
          </div>

          <div className="stat-card">
            <span className="stat-title">High Priority Cases</span>
            <div className="stat-value-group">
              <span className="stat-number stat-alert">{urgentCount}</span>
              <span className="stat-chip chip-coral">Urgent</span>
            </div>
            <p className="stat-sub">Immediate attention recommended</p>
          </div>

          <div className="stat-card">
            <span className="stat-title">People Reached</span>
            <div className="stat-value-group">
              <span className="stat-number">{totalAffected.toLocaleString()}</span>
              <span className="stat-chip chip-teal">Total</span>
            </div>
            <p className="stat-sub">Recorded across registered sites</p>
          </div>

          <div className="stat-card">
            <span className="stat-title">Cluster Status</span>
            <div className="stat-value-group">
              <span className="stat-number stat-ok">Connected</span>
              <span className="stat-chip chip-sage">Healthy</span>
            </div>
            <p className="stat-sub">Cloud database synchronized</p>
          </div>
        </section>

        {/* Content Split: Form & Table */}
        <div className="content-grid">
          {/* Form */}
          <section className="panel-card">
            <div className="panel-header">
              <h2>New Assistance Request</h2>
              <p>Submit supplies needed by relief field workers</p>
            </div>

            <form onSubmit={submitRequest} className="request-form">
              <div className="form-group">
                <label>Camp or Shelter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunrise Community Center"
                  value={form.campName}
                  onChange={e => setForm({ ...form, campName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location / Area</label>
                <input
                  type="text"
                  placeholder="e.g. North Zone - Block 3"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Resource Needed</label>
                <select
                  value={form.resourceType}
                  onChange={e => setForm({ ...form, resourceType: e.target.value })}
                >
                  <option value="WATER">💧 Clean Drinking Water (Liters)</option>
                  <option value="MEDICAL">🩺 Emergency First Aid Kits</option>
                  <option value="FOOD">🍞 Essential Food Rations (Meals)</option>
                  <option value="SHELTER_BLANKETS">⛺ Blankets & Tents (Bundles)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Units needed"
                    value={form.quantityNeeded}
                    onChange={e => setForm({ ...form, quantityNeeded: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>People Affected</label>
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

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Log Relief Request'}
              </button>
            </form>
          </section>

          {/* Table */}
          <section className="panel-card">
            <div className="panel-header panel-header-flex">
              <div>
                <h2>Active Request Queue</h2>
                <p>Prioritized according to demand and population size</p>
              </div>
              <button className="btn-secondary" onClick={loadData}>Refresh</button>
            </div>

            <div className="table-responsive">
              <table className="relief-table">
                <thead>
                  <tr>
                    <th>Score</th>
                    <th>Camp & Location</th>
                    <th>Supply Type</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(item => {
                    const supply = SUPPLY_CONFIG[item.resourceType] || {
                      label: item.resourceType,
                      unit: 'Units',
                      icon: '📦',
                      badgeClass: 'badge-slate'
                    };
                    const isUrgent = item.urgencyScore >= 1000;

                    return (
                      <tr key={item._id} className={isUrgent ? 'row-highlight' : ''}>
                        <td>
                          <span className={`score-badge ${isUrgent ? 'score-urgent' : 'score-normal'}`}>
                            {item.urgencyScore}
                          </span>
                        </td>
                        <td>
                          <div className="camp-name">{item.campName}</div>
                          <div className="camp-sub">{item.region} • {item.peopleAffected} people</div>
                        </td>
                        <td>
                          <span className={`supply-badge ${supply.badgeClass}`}>
                            <span>{supply.icon}</span>
                            <span>{supply.label}</span>
                          </span>
                        </td>
                        <td className="qty-cell">
                          <strong>{item.quantityNeeded.toLocaleString()}</strong>
                          <span className="qty-unit">{supply.unit}</span>
                        </td>
                        <td>
                          <button
                            className="btn-dispatch"
                            onClick={() => dispatchTruck(item._id)}
                            disabled={loading}
                          >
                            Mark Dispatched
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-notice">
                          <span className="empty-emoji">🌿</span>
                          <h3>Queue is clear</h3>
                          <p>All requested relief provisions have been dispatched.</p>
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
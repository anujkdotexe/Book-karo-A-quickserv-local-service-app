import React, { useState, useEffect } from 'react';
import adminAPI from '../../services/adminAPI';
import { useModal } from '../../components/Modal/Modal';
import './AdminAuditLogs.css';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');
  const modal = useModal();

  useEffect(() => {
    fetchAuditLogs();
  }, [filter, sortBy, sortDir]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = { 
        sortBy, 
        sortDir,
        page: 0,
        size: 100
      };
      if (filter !== 'ALL') {
        params.entityType = filter;
      }
      const data = await adminAPI.getAuditLogs(params);
      // data is PagedResponse with content array
      const logsArray = data?.content || [];
      setLogs(Array.isArray(logsArray) ? logsArray : []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      modal.error('Failed to load audit logs');
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking same column
      setSortDir(sortDir === 'DESC' ? 'ASC' : 'DESC');
    } else {
      // New column, default to DESC
      setSortBy(column);
      setSortDir('DESC');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <span className="sort-icon">⇅</span>;
    }
    return sortDir === 'DESC' 
      ? <span className="sort-icon active">↓</span>
      : <span className="sort-icon active">↑</span>;
  };

  const getActionColor = (action) => {
    const actionMap = {
      'CREATE': 'success',
      'UPDATE': 'info',
      'DELETE': 'danger',
      'APPROVE': 'success',
      'REJECT': 'danger',
      'CANCEL': 'warning',
      'LOGIN': 'info',
      'LOGOUT': 'info'
    };
    return actionMap[action] || 'default';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatChanges = (oldValues, newValues) => {
    if (!oldValues && !newValues) return 'No changes recorded';
    
    const changes = [];
    
    if (newValues) {
      Object.keys(newValues).forEach(key => {
        const oldVal = oldValues ? oldValues[key] : null;
        const newVal = newValues[key];
        
        if (oldVal !== newVal) {
          changes.push(
            <div key={key} className="change-item">
              <strong>{key}:</strong>
              {oldVal !== null && <span className="old-value">{String(oldVal)}</span>}
              {oldVal !== null && <span className="arrow">→</span>}
              <span className="new-value">{String(newVal)}</span>
            </div>
          );
        }
      });
    }
    
    return changes.length > 0 ? changes : 'No field changes';
  };

  const entityTypes = ['ALL', 'USER', 'VENDOR', 'SERVICE', 'BOOKING', 'PAYMENT', 'REVIEW', 'COUPON', 'BANNER', 'ANNOUNCEMENT'];

  if (loading) {
    return (
      <div className="admin-audit-logs">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-audit-logs">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p className="subtitle">System activity and change history</p>
      </div>

      <div className="audit-controls">
        <div className="filter-section">
          <label>Filter by Entity:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {entityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Total Logs:</span>
            <span className="stat-value">{logs.length}</span>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h3>No Audit Logs Found</h3>
          <p>No activity has been logged for {filter === 'ALL' ? 'any entity' : filter} yet.</p>
        </div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Timestamp {getSortIcon('createdAt')}
                </th>
                <th onClick={() => handleSort('entityType')} className="sortable">
                  Entity {getSortIcon('entityType')}
                </th>
                <th onClick={() => handleSort('action')} className="sortable">
                  Action {getSortIcon('action')}
                </th>
                <th>Entity ID</th>
                <th onClick={() => handleSort('performedBy')} className="sortable">
                  Performed By {getSortIcon('performedBy')}
                </th>
                <th>IP Address</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="timestamp-cell">{formatDateTime(log.createdAt)}</td>
                  <td>
                    <span className={`entity-badge ${log.entityType?.toLowerCase()}`}>
                      {log.entityType}
                    </span>
                  </td>
                  <td>
                    <span className={`action-badge ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="entity-id-cell">#{log.entityId}</td>
                  <td>User #{log.performedBy || 'System'}</td>
                  <td className="ip-cell">{log.ipAddress || 'N/A'}</td>
                  <td className="changes-cell">
                    {(log.oldValues || log.newValues) ? (
                      <details>
                        <summary>View Changes</summary>
                        <div className="changes-details">
                          {formatChanges(log.oldValues, log.newValues)}
                        </div>
                      </details>
                    ) : (
                      <span className="no-changes">No changes</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;

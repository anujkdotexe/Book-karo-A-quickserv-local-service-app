import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { useModal } from '../../components/Modal/Modal';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const modal = useModal();

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers(currentPage, 20);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    
    try {
      setLoading(true);
      const data = await adminAPI.searchUsers(searchQuery);
      setUsers(data);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    modal.confirm(
      `Are you sure you want to change this user's role to ${newRole}?`,
      {
        title: 'Change User Role',
        confirmText: 'Change Role',
        onConfirm: async () => {
          try {
            await adminAPI.updateUserRole(userId, newRole);
            modal.success('User role updated successfully');
            loadUsers();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to update role');
          }
        }
      }
    );
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    const newStatus = !user?.enabled;
    
    modal.confirm(
      `Are you sure you want to ${newStatus ? 'activate' : 'suspend'} this user?`,
      {
        title: 'Toggle User Status',
        confirmText: newStatus ? 'Activate' : 'Suspend',
        onConfirm: async () => {
          try {
            await adminAPI.toggleUserStatus(userId);
            modal.success(`User ${newStatus ? 'activated' : 'suspended'} successfully`);
            loadUsers();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to toggle status');
          }
        }
      }
    );
  };

  const handleDelete = async (userId) => {
    modal.confirm(
      'Are you sure you want to delete this user? This action cannot be undone.',
      {
        title: 'Delete User',
        confirmText: 'Delete',
        onConfirm: async () => {
          try {
            await adminAPI.deleteUser(userId);
            modal.success('User deleted successfully');
            loadUsers();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to delete user');
          }
        }
      }
    );
  };

  if (loading && users.length === 0) {
    return <div className="admin-users"><div className="loading-spinner">Loading users...</div></div>;
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage platform users and permissions</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="btn btn-primary">Search</button>
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); loadUsers(); }} className="btn btn-outline">
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>
                  <strong>{user.firstName} {user.lastName}</strong>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="USER">USER</option>
                    <option value="VENDOR">VENDOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="user-actions">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className="btn btn-outline btn-sm"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

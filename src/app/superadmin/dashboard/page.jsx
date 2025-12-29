'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'audit', 'system'
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingInstallations: 0,
    activeUsers: 0,
    systemStatus: 'healthy'
  });
  const [fetching, setFetching] = useState(true);
  const [bulkAction, setBulkAction] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'admin',
    name: '',
    permissions: []
  });

  // Available roles and permissions
  const roles = [
    { value: 'superAdmin', label: 'Super Admin', permissions: ['all'] },
    { value: 'admin', label: 'Administrator', permissions: ['view_customers', 'manage_meters', 'view_reports'] },
    { value: 'billing', label: 'Billing Manager', permissions: ['manage_billing', 'view_financials'] },
    { value: 'support', label: 'Support Agent', permissions: ['view_customers', 'update_tickets'] }
  ];

  const permissions = [
    { id: 'view_customers', label: 'View Customers' },
    { id: 'manage_customers', label: 'Manage Customers' },
    { id: 'manage_meters', label: 'Manage Meters' },
    { id: 'manage_billing', label: 'Manage Billing' },
    { id: 'view_financials', label: 'View Financials' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'view_audit_logs', label: 'View Audit Logs' },
    { id: 'send_notifications', label: 'Send Notifications' }
  ];

  // Redirect non-superAdmin users
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'superAdmin') {
        router.replace('/');
        return;
      }
      fetchDashboardData();
    }
  }, [loading, user]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setFetching(true);
    try {
      await Promise.all([
        fetchCustomers(),
        fetchUsers(),
        fetchAuditLogs(),
        fetchSystemHealth(),
        fetchStats()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/superadmin/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch users with roles
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/superadmin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/superadmin/audit-logs?limit=50');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const res = await fetch('/api/superadmin/system-health');
      if (!res.ok) throw new Error('Failed to fetch system health');
      const data = await res.json();
      setSystemHealth(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/superadmin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Approve meter installation
  const approveMeter = async (customerId) => {
    if (!confirm('Approve meter installation for this customer?')) return;

    try {
      const res = await fetch('/api/superadmin/meter/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error('Failed to approve meter');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Bulk meter approval
  const approveBulkMeters = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to approve');
      return;
    }

    if (!confirm(`Approve meters for ${selectedCustomers.length} selected customers?`)) return;

    try {
      const res = await fetch('/api/superadmin/meter/approve-bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: selectedCustomers }),
      });
      if (!res.ok) throw new Error('Failed to approve meters');
      setSelectedCustomers([]);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Create new user
  const createUser = async () => {
    if (!newUser.email || !newUser.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error('Failed to create user');
      
      setShowUserModal(false);
      setNewUser({ email: '', role: 'admin', name: '', permissions: [] });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Force logout user
  const forceLogoutUser = async (userId) => {
    if (!confirm('Force this user to logout from all sessions?')) return;

    try {
      const res = await fetch('/api/superadmin/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to force logout');
      alert('User has been logged out from all sessions');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Handle customer selection for bulk actions
  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Select all customers
  const selectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c._id));
    }
  };

  if (loading || fetching) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>Super Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'customers' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers ({customers.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'audit' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'system' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Health
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Customers</h3>
                <p className={styles.statNumber}>{stats.totalCustomers}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Pending Installations</h3>
                <p className={styles.statNumber}>{stats.pendingInstallations}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Active Users</h3>
                <p className={styles.statNumber}>{stats.activeUsers}</p>
              </div>
              <div className={styles.statCard}>
                <h3>System Status</h3>
                <p className={`${styles.statNumber} ${stats.systemStatus === 'healthy' ? styles.healthy : styles.unhealthy}`}>
                  {stats.systemStatus.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionButtons}>
                <button className={styles.btnPrimary} onClick={() => setActiveTab('customers')}>
                  Approve Pending Meters
                </button>
                <button className={styles.btnSecondary} onClick={() => setShowUserModal(true)}>
                  Add New User
                </button>
                <button className={styles.btnWarning} onClick={fetchDashboardData}>
                  Refresh All Data
                </button>
              </div>
            </div>

            {/* Recent Audit Logs Preview */}
            <div className={styles.recentLogs}>
              <h3>Recent Activity</h3>
              <div className={styles.logsList}>
                {auditLogs.slice(0, 5).map((log, index) => (
                  <div key={index} className={styles.logItem}>
                    <span className={styles.logTime}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={styles.logAction}>{log.action}</span>
                    <span className={styles.logUser}>{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            {/* Bulk Actions Toolbar */}
            <div className={styles.bulkToolbar}>
              <div className={styles.bulkSelection}>
                <input 
                  type="checkbox" 
                  checked={selectedCustomers.length === customers.length && customers.length > 0}
                  onChange={selectAllCustomers}
                  disabled={customers.length === 0}
                />
                <span>Select All ({selectedCustomers.length} selected)</span>
              </div>
              
              {selectedCustomers.length > 0 && (
                <div className={styles.bulkActions}>
                  <select 
                    value={bulkAction} 
                    onChange={(e) => setBulkAction(e.target.value)}
                    className={styles.bulkSelect}
                  >
                    <option value="">Choose action...</option>
                    <option value="approve">Approve Meters</option>
                    <option value="export">Export Selected</option>
                    <option value="notify">Send Notification</option>
                  </select>
                  <button 
                    className={styles.btnPrimary}
                    onClick={approveBulkMeters}
                    disabled={bulkAction !== 'approve'}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Customers Table */}
            {customers.length === 0 ? (
              <p className={styles.loading}>No customers found.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          checked={selectedCustomers.length === customers.length && customers.length > 0}
                          onChange={selectAllCustomers}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Meter</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedCustomers.includes(c._id)}
                            onChange={() => toggleCustomerSelection(c._id)}
                          />
                        </td>
                        <td>{c.firstName} {c.lastName}</td>
                        <td>{c.email}</td>
                        <td>{c.meterNumber || 'Not generated'}</td>
                        <td>
                          <span className={c.meterInstallationStatus === 'pending' ? styles.pending : styles.installed}>
                            {c.meterInstallationStatus}
                          </span>
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            {c.meterInstallationStatus === 'pending' && (
                              <button
                                className={styles.btnSuccess}
                                onClick={() => approveMeter(c._id)}
                              >
                                Approve
                              </button>
                            )}
                            <button
                              className={styles.btnInfo}
                              onClick={() => router.push(`/admin/customer/${c._id}`)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2>User Management</h2>
              <button className={styles.btnPrimary} onClick={() => setShowUserModal(true)}>
                + Add New User
              </button>
            </div>

            {users.length === 0 ? (
              <p className={styles.loading}>No users found.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Last Login</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select 
                            value={u.role} 
                            onChange={(e) => updateUserRole(u._id, e.target.value)}
                            className={styles.roleSelect}
                          >
                            {roles.map(role => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td>
                          <span className={u.isActive ? styles.active : styles.inactive}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.btnWarning}
                              onClick={() => forceLogoutUser(u._id)}
                              title="Force logout from all sessions"
                            >
                              Force Logout
                            </button>
                            <button
                              className={styles.btnDanger}
                              onClick={() => {
                                if (confirm(`Deactivate user ${u.email}?`)) {
                                  // Add deactivate API call here
                                }
                              }}
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2>Audit Trail</h2>
              <div className={styles.filterControls}>
                <select>
                  <option>All Actions</option>
                  <option>User Management</option>
                  <option>Meter Approvals</option>
                  <option>System Changes</option>
                </select>
                <input type="date" />
                <button className={styles.btnSecondary}>Export Logs</button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Target</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={styles.logBadge}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.user}</td>
                      <td>{log.target || 'N/A'}</td>
                      <td>{log.ipAddress}</td>
                      <td>
                        <button 
                          className={styles.btnInfo}
                          onClick={() => console.log('View details:', log)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && systemHealth && (
          <div className={styles.systemHealth}>
            <h2>System Status</h2>
            
            <div className={styles.healthGrid}>
              <div className={styles.healthCard}>
                <h3>API Status</h3>
                <div className={`${styles.statusIndicator} ${systemHealth.api === 'up' ? styles.up : styles.down}`}>
                  {systemHealth.api.toUpperCase()}
                </div>
              </div>
              
              <div className={styles.healthCard}>
                <h3>Database</h3>
                <div className={`${styles.statusIndicator} ${systemHealth.database === 'connected' ? styles.up : styles.down}`}>
                  {systemHealth.database.toUpperCase()}
                </div>
                <small>Latency: {systemHealth.dbLatency}ms</small>
              </div>
              
              <div className={styles.healthCard}>
                <h3>Memory Usage</h3>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${systemHealth.memoryUsage > 80 ? styles.high : ''}`}
                    style={{ width: `${systemHealth.memoryUsage}%` }}
                  ></div>
                </div>
                <small>{systemHealth.memoryUsage}% used</small>
              </div>
              
              <div className={styles.healthCard}>
                <h3>Active Sessions</h3>
                <p className={styles.statNumber}>{systemHealth.activeSessions}</p>
              </div>
            </div>

            <div className={styles.systemActions}>
              <h3>System Commands</h3>
              <div className={styles.actionButtons}>
                <button className={styles.btnWarning} onClick={() => {
                  if (confirm('Clear all system caches?')) {
                    // Add cache clear API call
                  }
                }}>
                  Clear Cache
                </button>
                <button className={styles.btnSecondary} onClick={fetchSystemHealth}>
                  Refresh Status
                </button>
                <button className={styles.btnDanger} onClick={() => {
                  if (prompt('Type "MAINTENANCE" to enable maintenance mode:') === 'MAINTENANCE') {
                    // Add maintenance mode API call
                  }
                }}>
                  Maintenance Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showUserModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Add New User</h3>
              
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Additional Permissions</label>
                <div className={styles.permissionsGrid}>
                  {permissions.map(perm => (
                    <label key={perm.id} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox"
                        checked={newUser.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const newPerms = e.target.checked
                            ? [...newUser.permissions, perm.id]
                            : newUser.permissions.filter(p => p !== perm.id);
                          setNewUser({...newUser, permissions: newPerms});
                        }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button className={styles.btnSecondary} onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button className={styles.btnPrimary} onClick={createUser}>
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
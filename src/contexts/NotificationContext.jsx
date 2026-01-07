'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Create context
const NotificationContext = createContext();

// Hook to access context
export const useNotification = () => useContext(NotificationContext);

// NotificationProvider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Add a new notification
   * @param {string} message - Notification text
   * @param {'success'|'error'|'info'|'warning'} type - Notification type
   * @param {number} duration - Duration in ms (default 5000ms)
   */
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, message, type };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  /**
   * Remove a notification manually
   */
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: '12px 20px',
              borderRadius: '6px',
              color: 'white',
              backgroundColor:
                n.type === 'success' ? '#28a745' :
                n.type === 'error' ? '#dc3545' :
                n.type === 'warning' ? '#ffc107' :
                '#17a2b8',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
            role="alert"
            onClick={() => removeNotification(n.id)}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

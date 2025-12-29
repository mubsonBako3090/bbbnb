'use client';
import React from 'react';

export default function NotificationList({ notifications = [] }) {
  return (
    <ul className="notification-list">
      {notifications.map(n => (
        <li key={n.id}>{n.message}</li>
      ))}
    </ul>
  );
}

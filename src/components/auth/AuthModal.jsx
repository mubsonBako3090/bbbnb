"use client";

import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import styles from "@/styles/Login.module.css";

export default function AuthModal({ currentForm, onClose, onSwitchToLogin, onSwitchToRegister }) {
  return (
    <div className={styles.authModal}>
      {currentForm === "login" && (
        <Login onClose={onClose} onSwitchToRegister={onSwitchToRegister} />
      )}
      {currentForm === "register" && (
        <Register onClose={onClose} onSwitchToLogin={onSwitchToLogin} />
      )}
    </div>
  );
}

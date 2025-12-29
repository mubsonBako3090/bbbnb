"use client";

import { useState, useCallback } from "react";
import AuthModal from "@/components/auth/AuthModal";

export default function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState("login"); // "login" | "register"

  // OPEN LOGIN
  const openLogin = useCallback(() => {
    setActiveForm("login");
    setIsOpen(true);
  }, []);

  // OPEN REGISTER
  const openRegister = useCallback(() => {
    setActiveForm("register");
    setIsOpen(true);
  }, []);

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 🚀 Return a REAL React component — not JSX or null
  const AuthModalComponent = () => {
    if (!isOpen) return null;
    return (
      <AuthModal
        currentForm={activeForm}
        onClose={closeModal}
        onSwitchToLogin={openLogin}
        onSwitchToRegister={openRegister}
      />
    );
  };

  return {
    openLogin,
    openRegister,
    closeModal,
    AuthModalComponent,
  };
}

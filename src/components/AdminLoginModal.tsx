import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { setAdminAuthState } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === 'admin123' || pin.trim() === 'cloudnet2026' || pin.trim() === 'imd') {
      setAdminAuthState(true);
      setError('');
      setPin('');
      onLoginSuccess();
      onClose();
    } else {
      setError('Invalid PIN. Use default "admin123" for testing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#0d162b] border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5 mb-5 mt-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center mx-auto">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            IMD Operational Access
          </h3>
          <p className="text-[11px] text-slate-400">
            Enter PIN to authorize moderation actions.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="Enter PIN (admin123)"
              className="w-full matte-input px-3 py-2 rounded-lg text-xs font-mono text-center tracking-widest"
              autoFocus
            />
            {error ? (
              <p className="text-[10px] text-rose-400 mt-1 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {error}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 mt-1 text-center font-mono">
                PIN: <strong className="text-slate-400">admin123</strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            Authenticate Officer
          </button>
        </form>

      </div>
    </div>
  );
};

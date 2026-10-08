import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, Loader } from 'lucide-react';
import type { QwenUser } from '../services/QwenAuthService';

interface QwenAccountPanelProps {
  user: QwenUser | null;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onLogout: () => Promise<void>;
  onSettingsClick: () => void;
  isLoading?: boolean;
}

export const QwenAccountPanel: React.FC<QwenAccountPanelProps> = ({
  user,
  isAuthenticated,
  onLoginClick,
  onLogout,
  onSettingsClick,
  isLoading = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
      >
        <User className="w-4 h-4" />
        Sign in with Qwen
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700"
        disabled={isLoading}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-white">{user.name}</span>
          <span className="text-xs text-gray-400">{user.email}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  onSettingsClick();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Connected to Qwen Account
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QwenAccountPanel;

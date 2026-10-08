// ============================================================================
// Computer Use Approval UI - Approval dialogs for desktop automation
// ============================================================================

import { useStore } from '../store';
import { Shield, Check, X, Monitor, MousePointer, Keyboard } from 'lucide-react';

export function ComputerUseApproval() {
  const { pendingApproval, approveAction, denyAction } = useStore();

  if (!pendingApproval) {
    return null;
  }

  const { id, tool, args, description } = pendingApproval;

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'click':
      case 'move_mouse':
        return <MousePointer className="w-6 h-6" />;
      case 'type':
      case 'key_press':
        return <Keyboard className="w-6 h-6" />;
      case 'screenshot':
        return <Monitor className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getToolColor = (toolName: string) => {
    switch (toolName) {
      case 'click':
      case 'move_mouse':
        return 'text-blue-400';
      case 'type':
      case 'key_press':
        return 'text-green-400';
      case 'screenshot':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleApprove = () => {
    approveAction(id);
  };

  const handleDeny = () => {
    denyAction(id);
  };

  const renderArgs = () => {
    if (!args) return null;

    return Object.entries(args).map(([key, value]) => (
      <div key={key} className="flex items-start gap-2 text-sm">
        <span className="text-gray-400 min-w-[100px]">{key}:</span>
        <span className="text-gray-100 font-mono">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 bg-gray-900 rounded-lg ${getToolColor(tool)}`}>
              {getToolIcon(tool)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                Action Approval Required
              </h2>
              <p className="text-sm text-gray-400">
                Desktop automation action pending
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>

          {/* Tool */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Tool</h3>
            <div className="px-3 py-2 bg-gray-900 rounded-lg">
              <code className="text-sm text-gray-100">{tool}</code>
            </div>
          </div>

          {/* Arguments */}
          {args && Object.keys(args).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Arguments
              </h3>
              <div className="px-3 py-2 bg-gray-900 rounded-lg space-y-2">
                {renderArgs()}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-300">
              ⚠️ This action will control your desktop. Make sure you trust the
              source of this request.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={handleDeny}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useStore } from '../store';

export function ComputerUseApproval() {
  const pendingApprovals = useStore(s => s.pendingApprovals);
  const approveAction = useStore(s => s.approveAction);
  const rejectAction = useStore(s => s.rejectAction);

  const [showDetails, setShowDetails] = useState<string | null>(null);

  if (pendingApprovals.length === 0) {
    return (
      <div className="computer-use-approval">
        <div className="approval-header">
          <h3>Computer Use Approvals</h3>
        </div>
        <div className="approval-empty">
          <p>No pending approvals</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (approvalId: string, remember: boolean = false) => {
    await approveAction(approvalId, remember);
  };

  const handleReject = async (approvalId: string) => {
    await rejectAction(approvalId);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'click':
        return '🖱️';
      case 'type':
        return '⌨️';
      case 'screenshot':
        return '📸';
      case 'scroll':
        return '📜';
      case 'key':
        return '⌨️';
      default:
        return '🖥️';
    }
  };

  const getActionDescription = (action: any) => {
    switch (action.type) {
      case 'click':
        return `Click at (${action.x}, ${action.y})`;
      case 'type':
        return `Type: "${action.text}"`;
      case 'screenshot':
        return action.region ? 'Capture region' : 'Capture screen';
      case 'scroll':
        return `Scroll by (${action.deltaX}, ${action.deltaY})`;
      case 'key':
        return `Press key: ${action.key}`;
      default:
        return 'Unknown action';
    }
  };

  return (
    <div className="computer-use-approval">
      <div className="approval-header">
        <h3>Computer Use Approvals</h3>
        <span className="approval-count">{pendingApprovals.length} pending</span>
      </div>

      <div className="approval-list">
        {pendingApprovals.map(approval => (
          <div key={approval.id} className="approval-item">
            <div className="approval-item-header">
              <span className="approval-icon">{getActionIcon(approval.action.type)}</span>
              <div className="approval-info">
                <span className="approval-action-type">{approval.action.type}</span>
                <span className="approval-action-desc">
                  {getActionDescription(approval.action)}
                </span>
              </div>
              <button
                onClick={() => setShowDetails(showDetails === approval.id ? null : approval.id)}
                className="approval-details-btn"
              >
                {showDetails === approval.id ? '▼' : '▶'}
              </button>
            </div>

            {showDetails === approval.id && (
              <div className="approval-details">
                <pre className="approval-json">
                  {JSON.stringify(approval.action, null, 2)}
                </pre>
              </div>
            )}

            <div className="approval-actions">
              <button
                onClick={() => handleApprove(approval.id, false)}
                className="approval-btn approve"
              >
                Allow
              </button>
              <button
                onClick={() => handleApprove(approval.id, true)}
                className="approval-btn approve-remember"
              >
                Allow & Remember
              </button>
              <button
                onClick={() => handleReject(approval.id)}
                className="approval-btn reject"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

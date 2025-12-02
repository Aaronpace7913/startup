import React from 'react';
import './invitations.css';
import { useWebSocket } from '../hooks/useWebSocket';

export function Invitations({ onInvitationAccepted, userEmail }) {
  const [invitations, setInvitations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // WebSocket connection for receiving invitations
  const { lastMessage } = useWebSocket(null, userEmail);

  React.useEffect(() => {
    loadInvitations();
  }, []);

  // Handle WebSocket messages
  React.useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'new-invitation') {
      setInvitations(prev => {
        // Avoid duplicates
        if (prev.find(inv => inv.id === lastMessage.invitation.id)) {
          return prev;
        }
        return [lastMessage.invitation, ...prev];
      });
    }
  }, [lastMessage]);

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        console.error('Failed to load invitations');
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`You've joined ${data.project.name}!`);
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        
        if (onInvitationAccepted) {
          onInvitationAccepted();
        }
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to accept invitation');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleDecline = async (invitationId) => {
    if (!window.confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${invitationId}/decline`, {
        method: 'POST'
      });

      if (response.ok) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        alert('Invitation declined');
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to decline invitation');
      }
    } catch (err) {
      console.error('Error declining invitation:', err);
      alert('Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return null;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="invitations-container">
      <div className="invitations-header">
        <h3>📬 Pending Invitations ({invitations.length})</h3>
      </div>

      <div className="invitations-list">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="invitation-card">
            <div className="invitation-info">
              <div className="invitation-title">
                <strong>{invitation.projectName}</strong>
              </div>
              <div className="invitation-details">
                <span className="invitation-from">
                  Invited by: {invitation.fromEmail}
                </span>
                <span className="invitation-time">
                  {formatDate(invitation.createdAt)}
                </span>
              </div>
            </div>
            <div className="invitation-actions">
              <button
                className="btn-accept"
                onClick={() => handleAccept(invitation.id)}
              >
                ✓ Accept
              </button>
              <button
                className="btn-decline"
                onClick={() => handleDecline(invitation.id)}
              >
                ✕ Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
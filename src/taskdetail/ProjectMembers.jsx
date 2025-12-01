import React from 'react';
import './projectMembers.css';

export function ProjectMembers({ projectId, projectOwner, currentUserEmail }) {
  const [members, setMembers] = React.useState([]);
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const isOwner = currentUserEmail === projectOwner;

  // Load members on mount
  React.useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        console.error('Failed to load members');
      }
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setError('');
    
    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    if (!inviteEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });

      if (response.ok) {
        alert(`Invitation sent to ${inviteEmail}!`);
        setInviteEmail('');
        setShowInviteModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Network error. Please try again.');
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    if (!window.confirm(`Remove ${memberEmail} from this project?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${encodeURIComponent(memberEmail)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMembers(members.filter(m => m !== memberEmail));
        alert(`${memberEmail} has been removed from the project`);
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/leave`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('You have left the project');
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to leave project');
      }
    } catch (err) {
      console.error('Error leaving project:', err);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return <div className="members-loading">Loading members...</div>;
  }

  return (
    <div className="project-members-container">
      <div className="members-header">
        <h3>👥 Project Members ({members.length})</h3>
        {isOwner && (
          <button 
            className="btn-invite"
            onClick={() => setShowInviteModal(true)}
          >
            + Invite Member
          </button>
        )}
        {!isOwner && (
          <button 
            className="btn-leave"
            onClick={handleLeaveProject}
          >
            Leave Project
          </button>
        )}
      </div>

      <div className="members-list">
        {members.map((memberEmail) => (
          <div key={memberEmail} className="member-item">
            <div className="member-info">
              <span className="member-icon">👤</span>
              <span className="member-email">{memberEmail}</span>
              {memberEmail === projectOwner && (
                <span className="owner-badge">Owner</span>
              )}
            </div>
            {isOwner && memberEmail !== projectOwner && (
              <button
                className="btn-remove"
                onClick={() => handleRemoveMember(memberEmail)}
                title="Remove member"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Invite Member to Project</h3>
            {error && <div className="error-message">{error}</div>}
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
              autoFocus
            />
            <div className="modal-buttons">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowInviteModal(false);
                  setError('');
                  setInviteEmail('');
                }}
              >
                Cancel
              </button>
              <button className="btn-create" onClick={handleInvite}>
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
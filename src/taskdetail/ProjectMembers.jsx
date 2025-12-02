import React from 'react';
import './ProjectMembers.css';

export function ProjectMembers({ projectId, projectOwner, currentUserEmail }) {
  const [members, setMembers] = React.useState([]);
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [searching, setSearching] = React.useState(false);

  const isOwner = currentUserEmail === projectOwner;

  // Load members on mount
  React.useEffect(() => {
    loadMembers();
  }, [projectId]);

  // Search for users as they type (minimum 1 character now)
  React.useEffect(() => {
    if (searchQuery.length >= 1) {
      searchUsers();
    } else {
      setSearchResults([]);
      setSelectedUser(null);
    }
  }, [searchQuery]);

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

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const users = await response.json();
        // Filter out users who are already members
        const filteredUsers = users.filter(user => !members.includes(user.email));
        setSearchResults(filteredUsers);
      } else {
        console.error('Failed to search users');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.email); // Show their email in the search box
    setSearchResults([]);
  };

  const handleSelectUserAndInvite = async (user) => {
    setError('');
    setSearching(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        alert(`Invitation sent to ${user.email}!`);
        setSearchQuery('');
        setSelectedUser(null);
        setShowInviteModal(false);
        setSearchResults([]);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Network error. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async () => {
    setError('');
    
    if (!searchQuery.trim()) {
      setError('Please enter a username or email');
      return;
    }

    const identifierToInvite = selectedUser ? selectedUser.email : searchQuery.trim();

    try {
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifierToInvite })
      });

      if (response.ok) {
        alert(`Invitation sent to ${identifierToInvite}!`);
        setSearchQuery('');
        setSelectedUser(null);
        setShowInviteModal(false);
        setSearchResults([]);
        setError('');
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

      {/* Invite Modal with Search */}
      {showInviteModal && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInviteModal(false);
              setError('');
              setSearchQuery('');
              setSelectedUser(null);
              setSearchResults([]);
            }
          }}
        >
          <div className="modal-content modal-search">
            <button 
              className="modal-close"
              onClick={() => {
                setShowInviteModal(false);
                setError('');
                setSearchQuery('');
                setSelectedUser(null);
                setSearchResults([]);
              }}
            >
              ✕
            </button>
            <h3>Invite Member to Project</h3>
            {error && <div className="error-message">{error}</div>}
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                  setError('');
                }}
                autoFocus
              />
              {searching && <div className="search-loading">Searching...</div>}
              
              {searchResults.length > 0 && !searching && (
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div 
                      key={user.email}
                      className="search-result-item"
                      onClick={() => handleSelectUserAndInvite(user)}
                    >
                      <span className="result-icon">👤</span>
                      <div className="result-info">
                        <div className="result-email">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 1 && searchResults.length === 0 && !searching && (
                <div className="no-results">
                  No users found. Type the exact username/email and click "Send Invitation" to invite them.
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowInviteModal(false);
                  setError('');
                  setSearchQuery('');
                  setSelectedUser(null);
                  setSearchResults([]);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-create" 
                onClick={handleInvite}
                disabled={!searchQuery.trim() || searching}
              >
                {searching ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
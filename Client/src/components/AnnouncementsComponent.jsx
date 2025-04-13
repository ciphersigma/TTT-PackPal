import React, { useState, useEffect } from 'react';
import './AnnouncementsComponent.css';

const AnnouncementsComponent = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Get announcements from localStorage
    const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
    
    if (storedAnnouncements.length > 0) {
      // Mark announcements as read if user is logged in
      if (userData) {
        const currentUser = JSON.parse(userData);
        const userId = currentUser.id;

        const updatedAnnouncements = storedAnnouncements.map(ann => {
          if (!ann.readBy.includes(userId)) {
            return {
              ...ann,
              readBy: [...ann.readBy, userId]
            };
          }
          return ann;
        });

        localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        setAnnouncements(updatedAnnouncements);
      } else {
        setAnnouncements(storedAnnouncements);
      }
    }
  }, []);

  const handleReaction = (announcementId, reactionType) => {
    if (!user) return; // Do nothing if no user is logged in
    
    const updatedAnnouncements = announcements.map(ann => {
      if (ann.id === announcementId) {
        return {
          ...ann,
          reactions: {
            ...ann.reactions,
            [reactionType]: ann.reactions[reactionType] + 1
          }
        };
      }
      return ann;
    });

    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    setAnnouncements(updatedAnnouncements);
  };

  // Show only unread or recent (last 3) announcements unless "show all" is clicked
  const displayedAnnouncements = showAll 
    ? announcements 
    : announcements.slice(0, 3);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="announcements-component">
      <div className="announcements-header">
        <h3>Announcements</h3>
        {announcements.length > 3 && (
          <button 
            className="show-all-btn" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      <div className="announcements-list">
        {displayedAnnouncements.map(announcement => (
          <div key={announcement.id} className="announcement-item">
            <h4>{announcement.title}</h4>
            <p className="announcement-date">{announcement.date}</p>
            <p className="announcement-message">{announcement.message}</p>
            
            <div className="announcement-reactions">
              <button 
                className="reaction-btn" 
                onClick={() => handleReaction(announcement.id, 'thumbsUp')}
              >
                👍 {announcement.reactions.thumbsUp}
              </button>
              <button 
                className="reaction-btn" 
                onClick={() => handleReaction(announcement.id, 'heart')}
              >
                ❤️ {announcement.reactions.heart}
              </button>
              <button 
                className="reaction-btn" 
                onClick={() => handleReaction(announcement.id, 'celebration')}
              >
                🎉 {announcement.reactions.celebration}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsComponent;
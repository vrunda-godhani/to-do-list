import React from 'react';
import './logo.css';
import chromeIcon from '../../photo/logo.png'; // adjust path based on file location


const Logo = ({ user }) => {
  const badgeText = !user?.picture
    ? (user?.name
        ? user.name.charAt(0).toUpperCase()
        : user?.email
          ? user.email.charAt(0).toUpperCase()
          : "U")
    : ""; // No badge if picture exists

  return (
    <div className="app-icon-wrapper">
      <img src={chromeIcon} alt="App Logo" className="app-icon" />
      {badgeText && <div className="badge">{badgeText}</div>}
    </div>
  );
};

export default Logo;

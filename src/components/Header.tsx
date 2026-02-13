import React, { useState } from 'react';

const Header: React.FC = () => {
  const [showLinks, setShowLinks] = useState(false);

  const handleNavToggle = () => {
    setShowLinks(!showLinks);
  };

  const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowLinks(false);

    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const id = href.slice(1);
      const element = document.getElementById(id);
      if (element) {
        const position = element.offsetTop - 62;
        window.scrollTo({
          left: 0,
          top: position,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <header id="home">
      {/* navbar */}
      <nav className="navbar">
        <div className="nav-center">
          {/* nav header */}
          <div className="nav-header">
            <h3 className="nav-logo">BoldAdventures</h3>
            <button type="button" className="nav-toggle" onClick={handleNavToggle}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
          {/* nav links */}
          <ul className={`nav-links ${showLinks ? 'show-links' : ''}`}>
            <li>
              <a href="#home" className="nav-link scroll-link" onClick={handleScrollLink}>
                home
              </a>
            </li>
            <li>
              <a href="#about" className="nav-link scroll-link" onClick={handleScrollLink}>
                about
              </a>
            </li>
            <li>
              <a href="#services" className="nav-link scroll-link" onClick={handleScrollLink}>
                services
              </a>
            </li>
            <li>
              <a href="#featured" className="nav-link scroll-link" onClick={handleScrollLink}>
                featured
              </a>
            </li>
            <li>
              <a href="#gallery" className="nav-link scroll-link" onClick={handleScrollLink}>
                gallery
              </a>
            </li>
          </ul>
          {/* nav icons */}
          <ul className="nav-icons">
            <li>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon"
              >
                <i className="fab fa-facebook"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      {/* hero */}
      <div className="hero">
        <div className="hero-banner">
          <h1>Discover your next adventure</h1>
          <p>Unleash your inner adventurer with our curated biking and hiking trips</p>
          <a href="#featured" className="btn hero-btn scroll-link" onClick={handleScrollLink}>
            explore tours
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;

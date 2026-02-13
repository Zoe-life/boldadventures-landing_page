import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
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
    <footer className="section footer">
      <ul className="footer-links">
        <li>
          <a href="#home" className="footer-link scroll-link" onClick={handleScrollLink}>
            home
          </a>
        </li>
        <li>
          <a href="#about" className="footer-link scroll-link" onClick={handleScrollLink}>
            about
          </a>
        </li>
        <li>
          <a href="#services" className="footer-link scroll-link" onClick={handleScrollLink}>
            services
          </a>
        </li>
        <li>
          <a href="#featured" className="footer-link scroll-link" onClick={handleScrollLink}>
            featured
          </a>
        </li>
        <li>
          <a href="#gallery" className="footer-link scroll-link" onClick={handleScrollLink}>
            gallery
          </a>
        </li>
      </ul>
      <ul className="footer-icons">
        <li>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
          >
            <i className="fab fa-facebook"></i>
          </a>
        </li>
        <li>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
          >
            <i className="fab fa-twitter"></i>
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
          >
            <i className="fab fa-instagram"></i>
          </a>
        </li>
      </ul>
      <p className="copyright">
        copyright &copy; BoldAdventures <span>{currentYear}</span>. all rights reserved
      </p>
    </footer>
  );
};

export default Footer;

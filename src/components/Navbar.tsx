import { useEffect } from 'react';

export function Navbar() {
  useEffect(() => {
    /* ═══════════════════════════════════════════ */
    /* MOBILE MENU TOGGLE                          */
    /* ═══════════════════════════════════════════ */

    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!hamburger || !mobileMenu) return;

    const toggleMenu = () => {
      mobileMenu.classList.toggle('open');

      // Animate hamburger to X
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (mobileMenu.classList.contains('open')) {
        (lines[0] as HTMLElement).style.transform = 'rotate(45deg) translate(5px, 5px)';
        (lines[1] as HTMLElement).style.opacity = '0';
        (lines[2] as HTMLElement).style.transform = 'rotate(-45deg) translate(5px, -5px)';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
      } else {
        (lines[0] as HTMLElement).style.transform = 'none';
        (lines[1] as HTMLElement).style.opacity = '1';
        (lines[2] as HTMLElement).style.transform = 'none';
        document.body.style.overflow = '';
      }
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close mobile menu when a link is clicked
    const links = mobileMenu.querySelectorAll('.mobile-link');
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      const lines = hamburger.querySelectorAll('.hamburger-line');
      (lines[0] as HTMLElement).style.transform = 'none';
      (lines[1] as HTMLElement).style.opacity = '1';
      (lines[2] as HTMLElement).style.transform = 'none';
      document.body.style.overflow = '';
    };

    links.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close mobile menu when clicking outside
    const clickOutside = (e: MouseEvent) => {
      if (!mobileMenu.contains(e.target as Node) && !hamburger.contains(e.target as Node) && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    };

    document.addEventListener('click', clickOutside);

    // Cleanup
    return () => {
      hamburger.removeEventListener('click', toggleMenu);
      links.forEach(link => link.removeEventListener('click', closeMenu));
      document.removeEventListener('click', clickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo — links to main website */}
        <a href="https://www.regalisrealtymedia.com" className="nav-logo">
          <img src="https://cdn.prod.website-files.com/6695980889d8d99cedb29bc7/677588ce72f981235e0deeb9_Regalis%20Realty%20Logo%20Symbol.png" alt="Regalis Realty Media" className="nav-logo-img" />
        </a>

        {/* Desktop Navigation Links */}
        <div className="nav-links" id="navLinks">
          <a href="https://www.regalisrealtymedia.com" className="nav-link">Home</a>
          <a href="https://regalisrealtymedia25.pixieset.com/regalisrealtymediaportfolio/compassphotos/" className="nav-link" target="_blank">Portfolio</a>
          <a href="https://pricing.regalisrealtymedia.com" className="nav-link" id="nav-pricing">Pricing</a>
          <a href="https://calculator.regalisrealtymedia.com" className="nav-link active" id="nav-calculator">Calculator</a>
          <a href="https://catalog.regalisrealtymedia.com" className="nav-link" id="nav-catalog">Catalog</a>
          <a href="https://branding.regalisrealtymedia.com" className="nav-link" id="nav-branding">Branding</a>
          <a href="https://portalguide.regalisrealtymedia.com" className="nav-link" id="nav-portal">Portal</a>
          <a href="https://www.regalisrealtymedia.com/calendar" className="nav-link">Contact</a>
        </div>

        {/* Mobile Hamburger Button */}
        <button className="nav-hamburger" id="navHamburger" aria-label="Toggle navigation menu">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className="mobile-menu" id="mobileMenu">
        <a href="https://www.regalisrealtymedia.com" className="mobile-link">Home</a>
        <a href="https://regalisrealtymedia25.pixieset.com/regalisrealtymediaportfolio/compassphotos/" className="mobile-link" target="_blank">Portfolio</a>
        <a href="https://pricing.regalisrealtymedia.com" className="mobile-link" id="mobile-nav-pricing">Pricing</a>
        <a href="https://calculator.regalisrealtymedia.com" className="mobile-link active" id="mobile-nav-calculator">Calculator</a>
        <a href="https://catalog.regalisrealtymedia.com" className="mobile-link" id="mobile-nav-catalog">Catalog</a>
        <a href="https://branding.regalisrealtymedia.com" className="mobile-link" id="mobile-nav-branding">Branding</a>
        <a href="https://portalguide.regalisrealtymedia.com" className="mobile-link" id="mobile-nav-portal">Portal</a>
        <a href="https://www.regalisrealtymedia.com/calendar" className="mobile-link">Contact</a>
      </div>
    </nav>
  );
}

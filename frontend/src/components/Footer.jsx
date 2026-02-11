import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../css/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__socials">
          <a href="#" className="footer__social-link" aria-label="Facebook"><Facebook size={24} /></a>
          <a href="#" className="footer__social-link" aria-label="Instagram"><Instagram size={24} /></a>
          <a href="#" className="footer__social-link" aria-label="Twitter"><Twitter size={24} /></a>
          <a href="#" className="footer__social-link" aria-label="YouTube"><Youtube size={24} /></a>
        </div>

        <div className="footer__links">
          <div className="footer__column">
            <a href="#">Audio Description</a>
            <a href="#">Investor Relations</a>
            <a href="#">Legal Notices</a>
          </div>
          <div className="footer__column">
            <a href="#">Help Centre</a>
            <a href="#">Jobs</a>
            <a href="#">Cookie Preferences</a>
          </div>
          <div className="footer__column">
            <a href="#">Gift Cards</a>
            <a href="#">Terms of Use</a>
            <a href="#">Corporate Information</a>
          </div>
          <div className="footer__column">
            <a href="#">Media Centre</a>
            <a href="#">Privacy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>

        <div className="footer__copyright">
          &copy; {new Date().getFullYear()} MovieApp, Inc.
        </div>
      </div>
    </footer>
  );
}

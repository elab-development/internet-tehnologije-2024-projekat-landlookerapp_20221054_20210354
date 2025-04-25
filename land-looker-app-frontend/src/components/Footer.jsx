import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-center">
        <p>© {new Date().getFullYear()} LandLooker</p>
      </div>
      <div className="footer-right">
        <p>Need support? Contact <a href="mailto:support24@landlooker.com">support24@landlooker.com</a></p>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";

const Footer = () => {
  // Array of social links with corresponding Bootstrap icons
  const socialLinks = [
    {
      title: "Facebook",
      url: "https://www.facebook.com",
      icon: "bi bi-facebook",
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com",
      icon: "bi bi-linkedin",
    },
    { title: "Twitter", url: "https://twitter.com", icon: "bi bi-twitter" },
    {
      title: "Instagram",
      url: "https://www.instagram.com",
      icon: "bi bi-instagram",
    },
  ];

  return (
    <footer
      style={{ backgroundColor: "#2a2a2a", color: "#fff" }}
      className="py-4"
    >
      <div className="container text-center">
        <div className="d-flex justify-content-center mb-3">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url} // External URL
              target="_blank" // Opens in a new tab
              rel="noopener noreferrer" // Prevents security risks
              className="mx-3 text-decoration-none text-light d-flex align-items-center"
            >
              <i className={`${link.icon} me-2`} aria-hidden="true"></i>
              {link.title}
            </a>
          ))}
        </div>
        <p className="m-0">&copy; {new Date().getFullYear()} QuickHop</p>
      </div>
    </footer>
  );
};

export default Footer;

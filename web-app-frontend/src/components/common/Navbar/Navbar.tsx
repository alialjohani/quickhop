/**
 * Navbar.tsx
 *
 * Main navigation bar component that would be used by different components/pages.
 */

import React, { ReactElement, useEffect } from "react";
import "./Navbar.scss";
import {
  COGNITO_CLIENT_ID,
  COGNITO_DOMAIN,
  COGNITO_REDIRECT_URI,
} from "../../../common/constants";
import LoginDropdown from "../Login/LoginDropdown";
import { NavLinkType } from "../../../common/types";
import Logout from "../Logout/Logout";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSeclector } from "../../../app/store/store";
import ModalComponent from "../Modal/ModalComponent";
import { openModal } from "../../../app/slices/modalSlice";
import Notification from "../Notification/Notification";
import JobSeekerLogin from "../Login/JobSeekerLogin";
import useModalBackdrop from "../../../hooks/useModalBackdrop";
import logo from "../../../../public/assets/logo/QuickHop_logo.png";
import { createPKCECodes } from "../../../common/pkce";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

// To be used for AWS Cognito for Recruiter SSO
const clientId = COGNITO_CLIENT_ID;
const cognitoDomain = COGNITO_DOMAIN;
const redirectUri = COGNITO_REDIRECT_URI;

// Initiate Login with AWS Cognito, to get grant code first, then cognito will redirect to a callback page
const initiateRecruiterLogin = async () => {
  const codeChallenge = await createPKCECodes();
  const scope = "openid profile email aws.cognito.signin.user.admin";
  const loginUrl = `${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  window.location.href = loginUrl;
};

type PropsType = {
  links: NavLinkType[];
  showLogout: boolean;
};

const Navbar = ({ links, showLogout }: PropsType): ReactElement => {
  const isModalOpen: boolean = useAppSeclector((state) => state.modal.isOpen);
  const isSpinning: boolean = useAppSeclector(
    (state) => state.spinner.isSpinning,
  );
  const dispatch = useAppDispatch();
  useModalBackdrop(isModalOpen || isSpinning);

  // Make auto scrolling to the section with Link tag from react-router-dom
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      <nav className="navbar navbar-expand-md bg-dark navbar-dark py-3">
        <div className="container">
          <Link to="/" className="navbar-brand text-light">
            <img src={logo} alt="QuickHop Logo" className="logo" />
            QuickHop
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navmenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto">
              {links.map((link, index) => (
                <li key={index} className="nav-item">
                  <Link to={link.ref} className="nav-link text-light">
                    {link.title}
                  </Link>
                </li>
              ))}
              {showLogout ? (
                <Logout />
              ) : (
                <LoginDropdown
                  recruiterLoginHandler={initiateRecruiterLogin}
                  jobSeekerLoginHandler={() => dispatch(openModal())}
                />
              )}
            </ul>
          </div>
        </div>
      </nav>
      {/* Global Notification Message Holder */}
      <Notification />
      {/* Global Modal Holder */}
      {/* User login Modal, login as recruiter or as job applicant */}
      {isModalOpen && (
        <ModalComponent title="Job Seeker Login" isHeaderDark={true}>
          <JobSeekerLogin />
        </ModalComponent>
      )}
      {isSpinning && <LoadingSpinner />}
    </>
  );
};

export default Navbar;

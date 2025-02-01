import React, { ReactNode } from "react";

interface PropsType {
  recruiterLoginHandler: () => void;
  jobSeekerLoginHandler: () => void;
}

const LoginDropdown = ({
  recruiterLoginHandler,
  jobSeekerLoginHandler,
}: PropsType): ReactNode => {
  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle text-light"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Login
      </a>
      <ul className="dropdown-menu dropdown-menu-end bg-dark">
        <li>
          <a
            className="dropdown-item text-light"
            role="button"
            onClick={recruiterLoginHandler}
          >
            As recruiter
          </a>
        </li>
        <li>
          <a
            className="dropdown-item text-light"
            role="button"
            onClick={jobSeekerLoginHandler}
          >
            As job applicant
          </a>
        </li>
      </ul>
    </li>
  );
};

export default LoginDropdown;

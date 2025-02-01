/**
 * JobSeekerMainPage.tsx
 *
 * This is the main view when the Job Seeker logged in.
 */

import React from "react";
import JobSeekerNavbar from "../../components/jobSeekerComponents/JobSeekerNavbar";
import { Outlet } from "react-router-dom";

const JobSeekerMainPage = () => {
  return (
    <>
      <>
        <JobSeekerNavbar />
        <Outlet />
      </>
    </>
  );
};

export default JobSeekerMainPage;

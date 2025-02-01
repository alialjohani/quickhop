/**
 * RecruiterMainPage.tsx
 *
 * This is the main view when the recruiter logged in.
 */

import React from "react";
import RecruiterNavbar from "../../components/recruiterComponents/RecruiterNavbar";
import { Outlet } from "react-router-dom";

const RecruiterMainPage = () => {
  return (
    <>
      <RecruiterNavbar />
      <Outlet />
    </>
  );
};

export default RecruiterMainPage;

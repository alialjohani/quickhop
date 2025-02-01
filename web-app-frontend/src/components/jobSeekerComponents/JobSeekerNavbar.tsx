import React from "react";
import Navbar from "../common/Navbar/Navbar";
import { NavLinkType } from "../../common/types";

const navLinks: NavLinkType[] = [
  {
    title: "New Opportunities",
    ref: "/job-seeker",
  },
  {
    title: "Interview Results",
    ref: "/job-seeker/list-interview-results",
  },
  {
    title: "C.V.",
    ref: "/job-seeker/cv",
  },
];

const JobSeekerNavbar = () => {
  return <Navbar links={navLinks} showLogout={true} />;
};
export default JobSeekerNavbar;

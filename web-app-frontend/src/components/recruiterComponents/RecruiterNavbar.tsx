import React from "react";
import Navbar from "../common/Navbar/Navbar";
import { NavLinkType } from "../../common/types";

const navLinks: NavLinkType[] = [
  {
    title: "Show All Posts",
    ref: "/recruiter",
  },
  {
    title: "Create New Post",
    ref: "/recruiter/create-new-post",
  },
  {
    title: "Company Knowledge Base",
    ref: "/recruiter/company-knowledge-base",
  },
  {
    title: "Profile",
    ref: "/recruiter/profile",
  },
];

const RecruiterNavbar = () => {
  return <Navbar links={navLinks} showLogout={true} />;
};

export default RecruiterNavbar;

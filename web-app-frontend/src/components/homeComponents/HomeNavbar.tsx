import React from "react";
import Navbar from "../common/Navbar/Navbar";
import { NavLinkType } from "../../common/types";

const navLinks: NavLinkType[] = [
  {
    title: "How it works",
    ref: "#How-It-Works",
  },
  {
    title: "Features",
    ref: "#features",
  },
  // {
  //   title: "Testimonials",
  //   ref: "#section3",
  // },
];

const HomeNavbar = () => {
  // Define the components to be shown in Navbar for home users.

  return <Navbar links={navLinks} showLogout={false} />;
};

export default HomeNavbar;

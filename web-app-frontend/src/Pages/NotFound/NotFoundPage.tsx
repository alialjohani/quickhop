import React from "react";

// Import an image for the 404 page
import NotFoundImage from "../../../public/assets/NotFound.png"; // Make sure to update the path to your image
import HomeNavbar from "../../components/homeComponents/HomeNavbar";
import Footer from "../../components/homeComponents/HomeSection/Footer/Footer";
import "./NotFound.scss";

const NotFoundPage = () => {
  return (
    <>
      <HomeNavbar />
      <section className="error-404 text-center py-5">
        <div className="container">
          {/* Image */}
          <img
            src={NotFoundImage}
            alt="404 - Page Not Found"
            className="not-found img-fluid"
          />

          {/* Title */}
          <h1 className="mt-4">Oops! This page is missing.</h1>

          {/* Message */}
          <p className="lead">
            We couldn’t find the page you were looking for.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default NotFoundPage;

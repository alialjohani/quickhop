import React from "react";

interface PropsType {
  title?: string;
  children: JSX.Element;
}

const Section = ({ title, children }: PropsType) => {
  return (
    <section className="d-flex justify-content-center align-items-stretch vh-100 pt-3">
      <div className="col-md-9">
        <div className="container">
          {title && (
            <>
              <h2 className="text-primary">{title}</h2>
              <hr />
            </>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};

export default Section;

import React, { ReactNode } from "react";

interface PropsType {
  id: string;
  title: string;
  children: ReactNode;
  textColor?: string;
}

const HomeSection = ({ id, title, children, textColor }: PropsType) => {
  const bgColor = textColor === "light" ? "bg-secondary" : "";
  const fontColor = textColor === "light" ? "light" : "primary";
  return (
    <section id={id} className={`p-5 ${bgColor}`}>
      <h1 className={`text-${fontColor}`}>{title}</h1>
      <hr className={`text-${fontColor}`} />
      {children}
    </section>
  );
};

export default HomeSection;

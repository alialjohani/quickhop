/**
 * HomeMainPage.tsx
 *
 * This is the main view for all guests.
 */

import React from "react";
import HomeNavbar from "../../components/homeComponents/HomeNavbar";
import Carousel from "../../components/homeComponents/Carousel/Carousel";
import HomeSection from "../../components/homeComponents/HomeSection/HomeSection";
import Footer from "../../components/homeComponents/HomeSection/Footer/Footer";
import ItemSection from "../../components/homeComponents/HomeSection/ItemSection";
import image1 from "../../../public/assets/how_it_works/Verified_Recruiter_Registration.jpg";
import image2 from "../../../public/assets/how_it_works/Effortless_Job_Posting_with_AI_Support.jpg";
import image3 from "../../../public/assets/how_it_works/Advanced_Candidate_Matching.jpg";
import image4 from "../../../public/assets/how_it_works/AI_Conducted_Interviews.jpg";
import image5 from "../../../public/assets/how_it_works/Detailed_Insights_Recruiters_JobSeekers.jpg";
import image6 from "../../../public/assets/how_it_works/Streamlined_Status_Updates.jpg";
import image7 from "../../../public/assets/features/Secure_Verified_Access_for_Recruiters.jpg";
import image8 from "../../../public/assets/features/AI_Generated_and_Conducted_Interviews.jpg";
import image9 from "../../../public/assets/features/Smart_Candidate_Matching.jpg";
import image10 from "../../../public/assets/features/OneClick_Interview_Access.jpg";
import image11 from "../../../public/assets/features/Actionable_Feedback_for_Growth.jpg";
import image12 from "../../../public/assets/features/RealTime_Status_Tracking.jpg";

const HomeMainPage = () => {
  return (
    <>
      <HomeNavbar />
      <Carousel />
      <HomeSection id="How-It-Works" title="How It Works">
        <ItemSection
          imageSrc={image1}
          title="Verified Recruiter Registration"
          content="Recruiters are securely registered by administrators, ensuring a verified hiring process. Once verified, they receive credentials to access the platform and post jobs."
          imagePosition="right"
        />
        <ItemSection
          imageSrc={image2}
          title="Effortless Job Posting with AI Support"
          content="Recruiters can quickly create job posts by entering job details. The AI then generates tailored interview questions, which the recruiter can further customize to fit the role."
          imagePosition="left"
        />
        <ItemSection
          imageSrc={image3}
          title="Advanced Candidate Matching"
          content="Once a job is posted, AI identifies qualified candidates based on the job requirements, sending relevant opportunities to job seekers’ dashboards."
          imagePosition="right"
        />
        <ItemSection
          imageSrc={image4}
          title="AI-Conducted Interviews"
          content="Job seekers can schedule an interview call at their convenience. During the call, an AI interviewer conducts the interview, asking customized questions and answering the candidate’s inquiries using company-provided information. The AI ensures a seamless, consistent experience for every candidate."
          imagePosition="left"
        />
        <ItemSection
          imageSrc={image5}
          title="Detailed Insights for Recruiters and Job Seekers"
          content="After the interview, recruiters receive an in-depth analysis, including sentiment insights, call recordings, compatibility scores, and a tailored resume for the role. Job seekers get personalized interview feedback and resume suggestions to enhance their profiles."
          imagePosition="right"
        />
        <ItemSection
          imageSrc={image6}
          title="Streamlined Status Updates"
          content="Recruiters can track each job post through automated stages, while job seekers see clear interview statuses like “Selected,” “Pending,” or “Not Selected” in their “Interview Results” section."
          imagePosition="left"
        />
      </HomeSection>
      <HomeSection id="features" title="Features">
        <ItemSection
          imageSrc={image7}
          title="Secure Access for Verified Recruiters"
          content="Administrator-verified accounts ensure only legitimate job posts, creating a safe space for job seekers."
          imagePosition="right"
        />
        <ItemSection
          imageSrc={image8}
          title="AI-Generated and Conducted Interviews"
          content="The AI not only prepares interview questions but also conducts the interviews, providing consistent, high-quality interactions tailored to each role."
          imagePosition="left"
        />
        <ItemSection
          imageSrc={image9}
          title="Smart Candidate Matching"
          content="Job seekers are matched with roles based on their qualifications, with relevant opportunities highlighted on their web page."
          imagePosition="right"
        />
        <ItemSection
          imageSrc={image10}
          title="Easy Interview Scheduling"
          content="Job seekers can set up interviews with one click and securely connect to the AI interviewer at a convenient time."
          imagePosition="left"
        />
        <ItemSection
          imageSrc={image11}
          title="Actionable Feedback for Growth"
          content="Recruiters receive detailed interview results, while job seekers benefit from feedback and tailored resume suggestions that support future applications."
          imagePosition="right"
        />
        <ItemSection
          imageSrc={image12}
          title="Real-Time Status Tracking"
          content='Recruiters follow each job post through status stages, while job seekers view updates in their "Interview Results," knowing if they are “Selected,” “Pending,” or “Not Selected.”'
          imagePosition="left"
        />
      </HomeSection>
      <Footer />
    </>
  );
};

export default HomeMainPage;

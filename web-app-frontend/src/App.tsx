import React from "react";
import { Route, Routes } from "react-router-dom";
import "./styles/css/custom.css";
// Import Bootstrap JS
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import HomeMainPage from "./Pages/Home/HomeMainPage";
import RecruiterMainPage from "./Pages/Recruiter/RecruiterMainPage";
import JobSeekerMainPage from "./Pages/JobSeeker/JobSeekerMainPage";
import NotFoundPage from "./Pages/NotFound/NotFoundPage";
import Profile from "./Pages/Recruiter/Profile";
import ListPosts from "./Pages/Recruiter/ListPosts";
import ListPostResults from "./Pages/Recruiter/ListPostResults";
import ListNewOpportunities from "./Pages/JobSeeker/ListNewOpportunities";
// import JobSeekerInterviewAiFeedback from "./Pages/JobSeeker/JobSeekerInterviewAiFeedback/JobSeekerInterviewAiFeedback";
import ListJobSeekerInterviewResults from "./Pages/JobSeeker/ListJobSeekerInterviewResults";
import JobOpportunityDetails from "./Pages/JobSeeker/JobOpportunityDetails";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { USERS } from "./common/constants";
import { AuthCallback } from "./components/common/Login/AuthCallback";
import PostForm from "./Pages/Recruiter/PostForm";
import CompanyKnowledgeBase from "./Pages/Recruiter/CompanyKnowledgeBase";
import CVForm from "./Pages/JobSeeker/CVForm";

function App() {
  return (
    <Routes>
      <Route path="/callback" element={<AuthCallback />} />{" "}
      {/* only for Cognito SSO, for Recruiter Login  */}
      <Route path="/" element={<HomeMainPage />} />
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute requiredRole={USERS.RECRUITER}>
            <RecruiterMainPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<ListPosts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="create-new-post" element={<PostForm />} />
        <Route path="edit-post/:jobId" element={<PostForm />} />
        <Route path="results/:jobId" element={<ListPostResults />} />
        <Route
          path="company-knowledge-base"
          element={<CompanyKnowledgeBase />}
        />
      </Route>
      <Route
        path="/job-seeker"
        element={
          <ProtectedRoute requiredRole={USERS.JOB_SEEKER}>
            <JobSeekerMainPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<ListNewOpportunities />} />
        <Route
          path="list-interview-results"
          element={<ListJobSeekerInterviewResults />}
        />
        {/* <Route
          path="interview-result-ai-feedback/:interviewResultId"
          element={<JobSeekerInterviewAiFeedback />}
        /> */}
        <Route
          path="job-opportunity/:opportunityId"
          element={<JobOpportunityDetails />}
        />
        <Route path="cv" element={<CVForm />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

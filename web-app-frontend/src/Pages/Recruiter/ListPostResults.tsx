/**
 * PostResults.tsx
 * After the job post due date is met, this page list all job seekers with their results.
 * The page shows: candidate's name, matching score, tailored resume to download, sentiment call analysis,
 * a button to make a call directly to candidate phone number, a call recording link to download the recording,
 * date/time of the interview call, call conversation as a text to be viewed.
 */
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListCards from "../../components/common/Card/ListCards";
import ResultCard from "../../components/recruiterComponents/ResultCard";
import { useGetRecruiterPostResultsQuery } from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import { NOTIFICATION_STYLE } from "../../common/constants";
import useSpinner from "../../hooks/useSpinner";

const ListPostResults = () => {
  const notifyAndRoute = useNotifyAndRoute();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const {
    data: results,
    isLoading,
    isError,
    error,
  } = useGetRecruiterPostResultsQuery(Number(jobId));

  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }
  useEffect(() => {
    if (results?.data.length === 0) {
      navigate("/NotFound");
    }
  }, [results, navigate]);

  const elements: JSX.Element[] = [];
  results?.data.map((result) => {
    elements.push(
      <ResultCard
        key={1}
        resultDetails={{
          id: result.id,
          JobId: result.jobPostId,
          JobSeekerId: result.jobSeekerId,
          JobSeekerName:
            result.JobSeeker.firstName + " " + result.JobSeeker.lastName,
          JobSeekerPhone: result.JobSeeker.phone,
          MatchingScore: result.matchingScore,
          InterviewDate: result.interviewCompletionDate ?? "",
          Resume: result.id.toString() ?? "",
          Recording: result.recordingUri ?? "",
          status: result.status,
        }}
      />,
    );
  });

  useSpinner([isLoading]);

  return (
    <section className="container mt-5">
      <ListCards elements={elements} />
    </section>
  );
};

export default ListPostResults;

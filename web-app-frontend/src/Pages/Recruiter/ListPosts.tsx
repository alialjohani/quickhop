/**
 * ListPosts.tsx
 *
 * Recruiter can see all posts, and each post is presented as a card.
 * Each card presents:
 * - Post ID: Auto generated from the system.
 * - Job Title: The title of the job when created by the recruiter.
 * - Starting Date/time: The date when the system can send emails to candidates and receiving calls.
 * - Ending Date/time: The date when the system will no longer accepting calls.
 * - Total Candidates: Display how many job applicants the system selected.
 * - Completed Interview Calls: Total of completed calls made up to the current time.
 * - Status: Each post has one of the following status:
 *    - Selecting Candidate: When the recruiter clicks on 'Submit' button on the CreateNewPost page,
 *      the system starts the process of selecting candidates. Recruiter can only view the post.
 *    - Ready to Run on {START_DATE}: When the system finished the process of selecting candidates and
 *      before {START_DATE}, the post status is in 'Ready To Run'. During this stage, the recruiter can view or delete
 *      the post.
 *    - Running until {END_DATE}: When the {START_DATE} is met, the post status is changed to 'Running'.
 *      The system in this stage starts by sending emails to all candidates in the list,
 *      and is ready to receive calls. During this stage, the recruiter can only view the post.
 *    - Completed: When the {END_DATE} is met, the post status is changed to 'Completed'.
 *      The system will not accepts any calls at this stage. The recruiter can view the post
 *      and the results (PostResult) for each candidate such as:
 *      listen to call, analysis of a call (sentiments), percentage of matching (between job and experience),
 *      view resume, make a call.
 */
import React, { useEffect, useState } from "react";
import JobPostCard from "../../components/recruiterComponents/JobPostCard";
import ListCards from "../../components/common/Card/ListCards";

import { NOTIFICATION_STYLE, POST_STATUS } from "../../common/constants";
import Section from "../../components/common/Section/Section";
import { useGetRecruiterAllJobPostsQuery } from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useRefreshPage from "../../hooks/useRefreshPage";
import useSpinner from "../../hooks/useSpinner";
import { isValidStatus } from "../../common/utils";

const ListPosts = () => {
  const notifyAndRoute = useNotifyAndRoute();
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const userId: number = useAppSeclector(authUserIdSelector);
  const {
    data: allPosts,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRecruiterAllJobPostsQuery(userId, {
    refetchOnMountOrArgChange: true, // Re-fetches every time the component mounts
    refetchOnFocus: true, // Re-fetches when the page regains focus
  });

  // Get backend data
  useEffect(() => {
    const newElements: JSX.Element[] = [];
    allPosts?.data?.map((post) => {
      // console.log(">>> post: ", post);
      if (isValidStatus(post.status, POST_STATUS)) {
        newElements.push(
          <JobPostCard
            jobId={post.id}
            jobTitle={post.title}
            status={post.status}
            totalSelectedCandidates={post.totalSelectedCandidates}
            startDate={post.aiCallsStartingDate.split("T")[0]}
            endDate={post.aiCallsEndDate.split("T")[0]}
          />,
        );
      } else {
        throw new Error(
          "Job Post Status is not matching to well defined POST_STATUS.",
        );
      }
    });
    setElements(newElements);
  }, [allPosts]);

  // console.log(">>> elements: ", elements);

  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useRefreshPage(refetch); // refresh page every few minutes to update the data

  useSpinner([isLoading]);

  return (
    <Section title="All Job Posts">
      <ListCards elements={elements} />
    </Section>
  );
};

export default ListPosts;

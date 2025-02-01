import React from "react";
import { NOTIFICATION_STYLE, POST_STATUS } from "../../common/constants";
import IconLabel from "../IconLabel/IconLabel";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card/Card";
import { Dictionary } from "../../common/types";
import Button from "../common/Form/Button";
import {
  useDeleteRecruiterJobPostMutation,
  useDeactivateJobPostMutation,
} from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";

interface PropsType {
  status: keyof typeof POST_STATUS;
  jobId: number;
  jobTitle: string;
  totalSelectedCandidates: number;
  startDate: string;
  endDate: string;
}

const JobPostCard = ({
  status,
  jobId,
  jobTitle,
  totalSelectedCandidates,
  startDate,
  endDate,
}: PropsType) => {
  const notifyAndRoute = useNotifyAndRoute();
  const navigate = useNavigate();
  const userId: number = useAppSeclector(authUserIdSelector);
  const [deletePost, { isLoading: isDeleteLoading }] =
    useDeleteRecruiterJobPostMutation();
  const [deactiveJobPost, { isLoading: isDeactiveLoading }] =
    useDeactivateJobPostMutation();

  const showResultsHandler = () => {
    navigate(`/recruiter/results/${jobId}`);
  };

  const deactivateHandler = async () => {
    try {
      await deactiveJobPost({
        recruiterId: userId,
        jobPostId: jobId,
      }).unwrap();
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  const showPostDetailsHandler = () => {
    navigate(`/recruiter/edit-post/${jobId}`);
  };

  const deleteHandler = async () => {
    try {
      await deletePost(jobId).unwrap();
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  const header: JSX.Element = (
    <IconLabel
      title={POST_STATUS[status].label}
      status={POST_STATUS[status].color}
    />
  );
  const bodyCard: Dictionary[] = [
    { "Job Post ID: ": jobId },
    { "Tile: ": jobTitle },
    { "Selected Candidates: ": totalSelectedCandidates },
    { "Start Date: ": startDate },
    { "End Date: ": endDate },
  ];

  // Check if 'Delete' button should be shown to delete a post
  // or 'End' button should be shown
  const footerLeft: JSX.Element | undefined =
    POST_STATUS[status].val === POST_STATUS.READY.val ? (
      <Button
        label="Delete"
        classes="btn btn-outline-danger"
        onClick={deleteHandler}
      />
    ) : POST_STATUS[status].val === POST_STATUS.RUNNING.val ? (
      <Button
        label="End Now"
        classes="btn btn-danger"
        onClick={deactivateHandler}
      />
    ) : POST_STATUS[status].val === POST_STATUS.COMPLETED.val ? (
      <Button
        label="Results"
        classes="btn btn-primary"
        onClick={showResultsHandler}
      />
    ) : undefined;

  const footerRight_Left: JSX.Element = (
    <Button
      label="View Post"
      classes="btn btn-outline text-primary"
      onClick={showPostDetailsHandler}
    />
  );

  useSpinner([isDeleteLoading, isDeactiveLoading]);

  return (
    <Card
      header={header}
      bodyCard={bodyCard}
      footerLeft={footerLeft}
      footerRight_Left={footerRight_Left}
    />
  );
};

export default JobPostCard;

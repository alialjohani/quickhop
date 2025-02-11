import React, { useState } from "react";
import { Dictionary, PostResultType } from "../../common/types";
import Button from "../common/Form/Button";
import Card from "../common/Card/Card";
import IconLabel from "../IconLabel/IconLabel";
import {
  CANDIDATE_STATUS,
  CandidateStatusType,
  NOTIFICATION_STYLE,
} from "../../common/constants";
import { usePostOpportunityResultStatusMutation } from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import useFileDownload from "../../hooks/useFileDownload";
import useSpinner from "../../hooks/useSpinner";
// import useOutboundCall from "../../hooks/useOutboundCall";

type FILE_TYPE = "resume" | "recording";

const ResultCard = ({ resultDetails }: { resultDetails: PostResultType }) => {
  const isCallMade: boolean = resultDetails.InterviewDate !== "";
  const [status, setStatus] = useState<CandidateStatusType>(
    resultDetails.status,
  );
  const notifyAndRoute = useNotifyAndRoute();

  const [postStatus, { isLoading, error }] =
    usePostOpportunityResultStatusMutation();
  const [triggerDownload, isDownloadLoading, isDownloadError] =
    useFileDownload();

  const downloadClickHandler = async (fileType: FILE_TYPE) => {
    try {
      if (resultDetails.id) {
        await triggerDownload({
          opportunityResultId: resultDetails.id,
          fileType: fileType,
        }).unwrap();
      }
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  const statusHandler = async (selectedStatus: CandidateStatusType) => {
    try {
      const response = await postStatus({
        id: resultDetails.id,
        status: selectedStatus,
      }).unwrap();
      if (response.status === "success") {
        setStatus(selectedStatus);
      }
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  if (error) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  const header: JSX.Element = (
    <IconLabel
      title={resultDetails.JobSeekerName}
      status={CANDIDATE_STATUS[status].color}
    />
  );

  const bodyCard: Dictionary[] = [
    { "Phone Number: ": resultDetails.JobSeekerPhone },
    { "Matching Score: ": resultDetails.MatchingScore.toString() },
    {
      "Interview Date: ": isCallMade
        ? resultDetails.InterviewDate?.split("T")[0]
        : "No Interview Call",
    },
    {
      "Resume: ": (
        <Button
          label="Download Resume"
          classes="btn btn-link p-0 text-primary"
          onClick={() => downloadClickHandler("resume")}
        />
      ),
    },
    {
      "Call recording: ": isCallMade ? (
        <Button
          label="Download MP3 File"
          classes="btn btn-link p-0 text-primary"
          onClick={() => downloadClickHandler("recording")}
        />
      ) : (
        "No Recording"
      ),
    },
  ];

  const footerLeft: JSX.Element = (
    <Button
      label="EXCLUDE"
      classes="btn btn btn-secondary"
      onClick={() => statusHandler("NOT_SELECTED")}
      disabled={status === "NOT_SELECTED"}
    />
  );
  const footerRight_Right: JSX.Element = (
    <Button
      label="SELECT"
      classes="btn btn btn-primary"
      onClick={() => statusHandler("SELECTED")}
      disabled={status === "SELECTED"}
    />
  );

  if (isDownloadError) {
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useSpinner([isLoading, isDownloadLoading]);
  return (
    <>
      <div id="ccp-container" style={{ display: "none" }}></div>
      <Card
        header={header}
        bodyCard={bodyCard}
        footerLeft={footerLeft}
        footerRight_Right={footerRight_Right}
      />
    </>
  );
};
export default ResultCard;

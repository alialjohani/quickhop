/**
 * JobSeekerResultCard.tsx
 *
 * The card summaries the results after the job seeker has completed the interview.
 * It gives information that are:
 * Job Title, Company Name, interviewCompletionDate,
 * Ai Tailored Resume (download file) for this specific job, Status: (selected, not-selected, pending).
 */

import { CANDIDATE_STATUS, NOTIFICATION_STYLE } from "../../common/constants";
import IconLabel from "../IconLabel/IconLabel";
import { Dictionary } from "../../common/types";
import Card from "../common/Card/Card";
import Button from "../common/Form/Button";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import useFileDownload from "../../hooks/useFileDownload";
import useSpinner from "../../hooks/useSpinner";

interface PropsType {
  opportunityResultId: number;
  jobTitle: string;
  companyName: string;
  interviewCompletionDate: string;
  status: keyof typeof CANDIDATE_STATUS;
  // aiFeedback: string | null;
  //interviewResultId: number;
}

const JobSeekerResultCard = ({
  opportunityResultId,
  jobTitle,
  companyName,
  interviewCompletionDate,
  status,
  // aiFeedback,
  //interviewResultId,
}: PropsType) => {
  const notifyAndRoute = useNotifyAndRoute();
  const [triggerDownload, isDownloadLoading, isDownloadError] =
    useFileDownload();
  const header: JSX.Element = (
    <IconLabel
      title={CANDIDATE_STATUS[status].label}
      status={CANDIDATE_STATUS[status].color}
    />
  );
  const bodyCard: Dictionary[] = [
    { "Job Title: ": jobTitle },
    { "Company Name: ": companyName },
    { "Interview Completion Date: ": interviewCompletionDate },
  ];

  const downloadAiGeneratedResume = async () => {
    try {
      if (opportunityResultId) {
        await triggerDownload({
          opportunityResultId: opportunityResultId,
          fileType: "resume",
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

  const footerRight_Right: JSX.Element = (
    <Button label="Resume" onClick={downloadAiGeneratedResume} />
  );

  if (isDownloadError) {
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useSpinner([isDownloadLoading]);
  return (
    <Card
      header={header}
      bodyCard={bodyCard}
      // footerLeft={footerLeft}
      footerRight_Right={footerRight_Right}
      isSeparatedLine
    />
  );
};

export default JobSeekerResultCard;

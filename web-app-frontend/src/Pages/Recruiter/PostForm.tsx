/**
 * CreateNewPost.tsx
 *
 * Recruiter can create new post with following details:
 * - Job title
 * - Job responsibility (day-to-day tasks)
 * - Preferred Qualifications (Nice-to-Haves)
 * - Required Qualifications (Must-Haves): The system would exclude job applicant if he does not meet this requirement.
 * - Starting Date: The date the system would start running (sending emails/receiving calls).
 * - End Date: The date the system would stop receiving interview calls.
 * - Post Knowledge Base: This can include any additional information such as: salary, benefits, work environment,
 *    application process, etc. These would be used with the 'Company Knowledge Base' by AI to answer candidate
 *    questions during the interview.
 * - maxCandidates: the system will not accepting any further calls when this number is met.
 * - minMatchingPercentage: The system will match each candidate by calculating a matching score.
 *    If the candidate does not meet this number, will not be considered.
 * - aiInterviewQuestions: The LLM will generate maximum of 10 questions that will be used for call interviews.
 *    Recruiter will review/edit the questions before posting the new job post.
 * During the creation process, the system would generate the interview questions (max 10), and the recruiter can
 * edit or approve the questions.
 *
 * The recruiter can test the system interaction by a Test button that would send an email for the recruiter and
 * the recruiter can make a call to the system for the interview.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Accordion from "../../components/common/Accordion/Accordion";

import AccordionItem from "../../components/common/Accordion/AccordionItem";
import useReactHookForm from "../../hooks/useReactHookForm";
import Input from "../../components/common/Form/Input";
import Form from "../../components/common/Form/Form";
import useAccordionStatus from "../../hooks/useAccordionStatus";
import DatePicker from "../../components/common/DatePicker/DatePicker";
import { FieldErrors } from "react-hook-form";
import GenAiInterviewQuestions from "../../components/recruiterComponents/GenAiInterviewQuestions";
import { RecruiterJobPostFormType } from "../../common/types";
import Button from "../../components/common/Form/Button";

import {
  FIELDS_PostForm,
  getPostStatus,
  NOTIFICATION_STYLE,
  POST_STATUS,
} from "../../common/constants";
import "./PostForm.scss";

import Section from "../../components/common/Section/Section";
import CancelButton from "../../components/common/Form/CancelButton";
import GroupButtons from "../../components/common/Form/GroupButtons";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";

import {
  getVALIDATION_DATE,
  getVALIDATION_STRING,
  onDateChangeTriggerValidation,
} from "../../common/formsValidations";
import {
  useGetRecruiterAllJobPostsQuery,
  usePostRecruiterJobPostMutation,
} from "../../app/slices/apiSlice";
import { authUserIdSelector } from "../../app/slices/authSlice";
import { useAppSeclector } from "../../app/store/store";
import useSpinner from "../../hooks/useSpinner";

// percentage as a number between 50 to 100
const PERCENTAGE_PATTERN = /^(100|[5-9][0-9])$/;
const AT_LEAST_ONE_PATTERN = /^[1-9][0-9]*$/;

const PostForm = () => {
  const notifyAndRoute = useNotifyAndRoute();
  const initialValues: RecruiterJobPostFormType = {
    id: 0,
    status: POST_STATUS.NEW.val,
    title: "",
    description: "",
    responsibility: "",
    preferredQualification: "",
    requiredQualification: "",
    maxCandidates: 50,
    minMatchingPercentage: 50,
    aiCallsStartingDate: "",
    aiCallsEndDate: "",
    jobKB: "",
    aiInterviewQuestions: [],
  };
  const [isBackendData, setIsBackendData] = useState<boolean>(false);

  // Calling a custom hook to use react-hook-form
  // with useReactHookForm: order of fields are important
  const {
    handleSubmit,
    errors,
    //fieldsRegister,
    touchedFields,
    getValues,
    setValue,
    register,
    control,
    trigger,
    isValid,
    reset,
  } = useReactHookForm<RecruiterJobPostFormType>(
    //keysArray,
    initialValues,
    //VALIDATIONS,
    "onTouched",
  );

  const userId: number = useAppSeclector(authUserIdSelector);
  const {
    data: allPosts,
    isLoading,
    isError,
    error,
  } = useGetRecruiterAllJobPostsQuery(userId);

  const [postJobPost] = usePostRecruiterJobPostMutation();

  // Handle any fetching data api errors
  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  // Edit existing post
  const { jobId } = useParams();

  useEffect(() => {
    if (jobId) {
      const POST = allPosts?.data.find((post) => post.id === Number(jobId));
      if (!POST) {
        notifyAndRoute(
          "There is an error with your request.",
          NOTIFICATION_STYLE.ERROR,
          "/",
        );
        return; // Exit the function here
      }
      setIsBackendData(true);
      reset({
        id: POST.id,
        title: POST.title,
        description: POST.description,
        status: getPostStatus(POST.status),
        responsibility: POST.responsibility,
        preferredQualification: POST.preferredQualification,
        requiredQualification: POST.requiredQualification,
        maxCandidates: POST.maxCandidates,
        minMatchingPercentage: POST.minMatchingPercentage,
        aiCallsStartingDate: POST.aiCallsStartingDate,
        aiCallsEndDate: POST.aiCallsEndDate,
        jobKB: POST.jobKB,
        aiInterviewQuestions: POST.aiInterviewQuestions,
      });
    }
  }, [jobId, allPosts, reset]);

  // To deal with Accordion Status (the circle color)
  const sharedStatusParams = {
    touchedFields: touchedFields,
    errors: errors,
    isBackendData, // new form data, or prefilled from backend data?
  };
  const jobDetailsAccordionGroup = {
    fields: [
      FIELDS_PostForm.jobTitle,
      FIELDS_PostForm.jobDescription,
      FIELDS_PostForm.jobResponsibility,
    ],
  };
  const matchingCriteriaAccordionGroup = {
    fields: [
      FIELDS_PostForm.requiredQualification,
      FIELDS_PostForm.preferredQualification,
      FIELDS_PostForm.minMatchingPercentage,
    ],
  };
  const interviewCallSettingsAccordionGroup = {
    fields: [
      FIELDS_PostForm.maxCandidates,
      FIELDS_PostForm.aiCallsStartingDate,
      FIELDS_PostForm.aiCallsEndDate,
      FIELDS_PostForm.jobKB,
    ],
  };
  const interviewQuestionsAccordionGroup = {
    fields: [FIELDS_PostForm.aiInterviewQuestions],
  };

  // Calling the Accordion custom hook
  const [
    jobDetailsAccordionStatus,
    matchingCriteriaAccordionStatus,
    interviewCallSettingsAccordionStatus,
    interviewQuestionsAccordionStatus,
  ] = useAccordionStatus<RecruiterJobPostFormType>(sharedStatusParams, [
    jobDetailsAccordionGroup,
    matchingCriteriaAccordionGroup,
    interviewCallSettingsAccordionGroup,
    interviewQuestionsAccordionGroup,
  ]);

  // When the form is submitted
  const submitHandler = async (data: RecruiterJobPostFormType) => {
    try {
      if (isValid) {
        data.status =
          data.status === POST_STATUS.NEW.val
            ? POST_STATUS.SELECTING.val
            : data.status;
        await postJobPost({
          recruiterId: userId,
          title: data.title,
          responsibility: data.responsibility,
          description: data.description,
          status: getPostStatus(data.status),
          preferredQualification: data.preferredQualification || "",
          requiredQualification: data.requiredQualification || "",
          maxCandidates: data.maxCandidates,
          minMatchingPercentage: data.minMatchingPercentage,
          aiCallsStartingDate: data.aiCallsStartingDate,
          aiCallsEndDate: data.aiCallsEndDate,
          jobKB: data.jobKB || "",
          aiInterviewQuestions: data.aiInterviewQuestions,
        }).unwrap();
        notifyAndRoute(
          "Your job post is created successfully.",
          NOTIFICATION_STYLE.SUCCESS,
          "/recruiter",
        );
      }
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  // When the form has error after submit action
  const errorHandler = (errors: FieldErrors<RecruiterJobPostFormType>) => {
    console.log("Form errors: ", errors);
  };

  useSpinner([isLoading]);

  return (
    <Section title={`${isBackendData ? "Job Post Details" : "New Job Post"}`}>
      <Form onSubmit={handleSubmit(submitHandler, errorHandler)}>
        <Accordion>
          <AccordionItem
            id="jobDetails"
            title="Job Details"
            status={jobDetailsAccordionStatus}
          >
            <Input
              id="jobTitle"
              label="Job Title"
              type="text"
              errorMessage={errors.title?.message}
              registerObject={register(
                FIELDS_PostForm.jobTitle,
                getVALIDATION_STRING("Job title", 3, 100),
              )}
              disabled={isBackendData}
            />
            <Input
              id="jobDescription"
              label="Job Description"
              type="text"
              errorMessage={errors.description?.message}
              registerObject={register(
                FIELDS_PostForm.jobDescription,
                getVALIDATION_STRING("Job description", 100, 1500),
              )}
              isTextArea
              disabled={isBackendData}
            />
            <Input
              id="jobResponsibility"
              label="Job Responsibility"
              type="text"
              errorMessage={errors.responsibility?.message}
              registerObject={register(
                FIELDS_PostForm.jobResponsibility,
                getVALIDATION_STRING("Job responsibility", 500, 4000),
              )}
              isTextArea
              disabled={isBackendData}
            />
          </AccordionItem>
          <AccordionItem
            id="matchingCriteria"
            title="Matching Criteria"
            status={matchingCriteriaAccordionStatus}
          >
            <Input
              id="requiredQualification"
              label="Required Qualification"
              type="text"
              errorMessage={errors.requiredQualification?.message}
              registerObject={register(FIELDS_PostForm.requiredQualification)}
              maxLength={1500}
              isTextArea
              disabled={isBackendData}
            />
            <Input
              id="preferredQualification"
              label="Preferred Qualification"
              type="text"
              errorMessage={errors.preferredQualification?.message}
              registerObject={register(FIELDS_PostForm.preferredQualification)}
              maxLength={1000}
              isTextArea
              disabled={isBackendData}
            />
            <Input
              id="minMatchingPercentage"
              label="Minimum Accepted Matching Percentage"
              type="number"
              errorMessage={errors.minMatchingPercentage?.message}
              registerObject={register(FIELDS_PostForm.minMatchingPercentage, {
                required: {
                  value: true,
                  message: "Please enter the minimum accepted percentage.",
                },
                pattern: {
                  value: PERCENTAGE_PATTERN,
                  message: "Please enter a valid value between 50% up to 100%.",
                },
              })}
              disabled={isBackendData}
            />
          </AccordionItem>
          <AccordionItem
            id="interviewCallSettings"
            title="Interview Call Settings"
            status={interviewCallSettingsAccordionStatus}
          >
            <Input
              id="maxCandidates"
              label="Maximum Number of Interviewees"
              type="number"
              errorMessage={errors.maxCandidates?.message}
              registerObject={register(FIELDS_PostForm.maxCandidates, {
                required: {
                  value: true,
                  message: "Please enter the maximum number.",
                },
                pattern: {
                  value: AT_LEAST_ONE_PATTERN,
                  message:
                    "Please enter a valid value that at least to be one.",
                },
              })}
              disabled={isBackendData}
            />
            <DatePicker<RecruiterJobPostFormType>
              field={FIELDS_PostForm.aiCallsStartingDate}
              label="Interview Starting Date"
              errorMessage={errors.aiCallsStartingDate?.message}
              setValue={setValue}
              registerObject={register(
                FIELDS_PostForm.aiCallsStartingDate,
                getVALIDATION_DATE<RecruiterJobPostFormType>(
                  getValues,
                  "START_DATE",
                  FIELDS_PostForm.aiCallsStartingDate,
                  FIELDS_PostForm.aiCallsEndDate,
                ),
              )}
              initialDate={
                initialValues.aiCallsStartingDate ||
                getValues(FIELDS_PostForm.aiCallsStartingDate)
              }
              disabled={isBackendData}
              onChange={() =>
                onDateChangeTriggerValidation<RecruiterJobPostFormType>(
                  "START_DATE",
                  trigger,
                  FIELDS_PostForm.aiCallsStartingDate,
                  FIELDS_PostForm.aiCallsEndDate,
                )
              }
            />
            <DatePicker<RecruiterJobPostFormType>
              field={FIELDS_PostForm.aiCallsEndDate}
              label="Interview End Date"
              errorMessage={errors.aiCallsEndDate?.message}
              setValue={setValue}
              registerObject={register(
                FIELDS_PostForm.aiCallsEndDate,
                getVALIDATION_DATE<RecruiterJobPostFormType>(
                  getValues,
                  "END_DATE",
                  FIELDS_PostForm.aiCallsStartingDate,
                  FIELDS_PostForm.aiCallsEndDate,
                ),
              )}
              initialDate={
                initialValues.aiCallsEndDate ||
                getValues(FIELDS_PostForm.aiCallsEndDate)
              }
              disabled={isBackendData}
              onChange={() =>
                onDateChangeTriggerValidation<RecruiterJobPostFormType>(
                  "END_DATE",
                  trigger,
                  FIELDS_PostForm.aiCallsStartingDate,
                  FIELDS_PostForm.aiCallsEndDate,
                )
              }
            />
            <Input
              id={FIELDS_PostForm.jobKB}
              label="Interview Knowledge Base"
              type="text"
              errorMessage={errors.jobKB?.message}
              registerObject={register(FIELDS_PostForm.jobKB)}
              isTextArea
              disabled={isBackendData}
            />
          </AccordionItem>
          <AccordionItem
            id="interviewQuestionsSettings"
            title="AI Interview Questions"
            status={interviewQuestionsAccordionStatus}
          >
            <GenAiInterviewQuestions
              register={register}
              control={control}
              errors={errors}
              fieldName={FIELDS_PostForm.aiInterviewQuestions}
              trigger={trigger}
              getValues={getValues}
              disabled={isBackendData}
            />
          </AccordionItem>
        </Accordion>
        {/* Submit and Cancel buttons */}
        <GroupButtons>
          <CancelButton url="/recruiter" />
          <Button
            type="submit"
            label="Submit"
            classes="btn btn-primary"
            disabled={isBackendData}
          />
        </GroupButtons>
      </Form>
    </Section>
  );
};

export default PostForm;

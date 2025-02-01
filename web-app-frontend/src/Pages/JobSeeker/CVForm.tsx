/**
 * CVForm.tsx
 *
 * This page is the form to create and edit the C.V. details.
 * The job seeker should enters as much details as possible so the AI can generate good matching score as well as
 * good tailored resume.
 * In CV, job seeker can enter:
 * - Profile: name, country, city, email, phone, linkedin, other links.
 * - Education: School, Location, Field of Study, dates, is currently enrolled, description
 * - Work History: job title, company, location, dates, is currently working, role description.
 * - Certification: name, issuing organization, issue date, expiration date, Credential URL, Description.
 **Note: The AI should generate hard-skill/soft-skill in a tailored resume based on given details.
 */

import React, { useEffect, useState } from "react";
import Section from "../../components/common/Section/Section";
import Form from "../../components/common/Form/Form";
import Accordion from "../../components/common/Accordion/Accordion";
import AccordionItem from "../../components/common/Accordion/AccordionItem";
import useReactHookForm from "../../hooks/useReactHookForm";
import useAccordionStatus from "../../hooks/useAccordionStatus";
import GroupButtons from "../../components/common/Form/GroupButtons";
import CancelButton from "../../components/common/Form/CancelButton";
import Button from "../../components/common/Form/Button";
import EducationForms from "../../components/jobSeekerComponents/EducationForms";
import {
  JobSeekerCVCertificationType,
  JobSeekerCVEductionType,
  JobSeekerCVFormType,
  JobSeekerCVWorkType,
  RequestAiFeedbackCV,
  ResponseAiFeedbackCV,
} from "../../common/types";
import WorkForms from "../../components/jobSeekerComponents/WorkForms";
import CertificationsForm from "../../components/jobSeekerComponents/CertificationsForm";
import ProfileForm from "../../components/jobSeekerComponents/ProfileForm";

import {
  useGetJobSeekerCVQuery,
  usePostJobSeekerCVAiFeedbackMutation,
  usePostJobSeekerCVMutation,
} from "../../app/slices/apiSlice";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import useScrollToTop from "../../hooks/useScrollToTop";
import {
  FIELDS_CVCertification,
  FIELDS_CVEducations,
  FIELDS_CVForm,
  FIELDS_CVWorks,
  NOTIFICATION_STYLE,
} from "../../common/constants";
import { useAppSeclector } from "../../app/store/store";
import { authSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";

function preprocessFetchedData<T extends object, K extends keyof T>(
  arrayObj: T[],
  fieldName: K,
) {
  const results: T[] = [];
  if (arrayObj) {
    arrayObj.forEach((obj) => {
      results.push({
        ...obj,
        [fieldName]: obj[fieldName] === null ? "" : obj[fieldName],
      });
    });
  }
  return results;
}

function preprocessSubmitionData(data: JobSeekerCVFormType) {
  if (data.Education) {
    // Convert endDate to null if still enrolled
    data.Education.forEach((edu) => {
      if (edu.isEnrolled) {
        edu.endDate = null;
      }
    });
  }

  if (data.Works) {
    // Convert endDate to null if still working in the company
    data.Works.forEach((work) => {
      if (work.isStillWorking) {
        work.endDate = null;
      }
    });
  }

  if (data.Certifications) {
    data.Certifications.forEach((cert) => {
      // Convert expirationDate to null if certification has no expiry date
      if (cert.noExpirationDate) {
        cert.expirationDate = null;
      }
    });
  }
}

interface AiFeedbackPorcessedData {
  eduStartIndex: number;
  workStartIndex: number;
  certStartIndex: number;
  reqData: RequestAiFeedbackCV[];
}
function preprocessAiFeedbackRequestData(
  data: JobSeekerCVFormType,
): AiFeedbackPorcessedData {
  const result: AiFeedbackPorcessedData = {
    eduStartIndex: -1,
    workStartIndex: -1,
    certStartIndex: -1,
    reqData: [],
  };

  if (data.Education.length > 0) {
    data.Education.forEach((edu) => {
      result.reqData.push({
        titleOrField: edu.degree + " " + edu.fieldOfStudy,
        section: "Education",
        description: edu.description,
      });
    });
    result.eduStartIndex = 0;
  }

  if (data.Works.length > 0) {
    data.Works.forEach((work) => {
      result.reqData.push({
        titleOrField: work.title,
        section: "Work",
        description: work.description,
      });
    });
    result.workStartIndex = data.Education.length;
  }

  if (data.Certifications.length > 0) {
    data.Certifications.forEach((cert) => {
      result.reqData.push({
        titleOrField: cert.name,
        section: "Certification",
        description: cert.description,
      });
    });
    result.certStartIndex = data.Education.length + data.Works.length;
  }

  return result;
}

const CVForm = () => {
  const [aiFeedbackMessages, setAiFeedbackMessages] =
    useState<ResponseAiFeedbackCV | null>(null);
  const [aiFeedbackIndexes, setAiFeedbackIndexes] = useState<
    Omit<AiFeedbackPorcessedData, "reqData">
  >({
    eduStartIndex: -1,
    workStartIndex: -1,
    certStartIndex: -1,
  });

  const notifyAndRoute = useNotifyAndRoute();
  const scrollToTop = useScrollToTop();
  const authUser = useAppSeclector(authSelector);
  // indicate whether the form is a new without prefilled data, or from backend data
  const [isBackendData, setIsBackendData] = useState<boolean>(false);

  // Prepare the react-hook-form
  const initialValues: JobSeekerCVFormType = {
    id: 0,
    firstName: "",
    lastName: "",
    email: authUser.email,
    phone: "",
    linkedin: "",
    country: "",
    region: "",
    city: "",
    Education: [],
    Works: [],
    Certifications: [],
  };

  const {
    errors,
    touchedFields,
    setValue,
    getValues,
    handleSubmit,
    control,
    register,
    trigger,
    watch,
    reset,
    isValid,
    dirtyFields,
  } = useReactHookForm<JobSeekerCVFormType>(initialValues, "onBlur");

  const {
    data: cvData,
    isLoading,
    isError,
    error,
  } = useGetJobSeekerCVQuery(authUser.userId, {
    refetchOnMountOrArgChange: true, // Re-fetches every time the component mounts
    refetchOnFocus: true, // Re-fetches when the page regains focus
  });

  const [postAiFeedback, { isLoading: aiIsLoading, error: aiError }] =
    usePostJobSeekerCVAiFeedbackMutation();

  const [postCV] = usePostJobSeekerCVMutation(); // to save data by POST request

  useEffect(() => {
    console.log(">>> cvData: ", cvData?.data);
    if (cvData?.data) {
      setIsBackendData(true);
      // Preprocess data (if endDate is null, change it to empty string)
      let educations: JobSeekerCVEductionType[] = [];
      if (cvData.data.Education) {
        educations = preprocessFetchedData(
          cvData?.data?.Education,
          FIELDS_CVEducations.educations_EndDate,
        );
      }
      // Preprocess data (if endDate is null, change it to empty string)
      let works: JobSeekerCVWorkType[] = [];
      if (cvData.data.Works) {
        works = preprocessFetchedData(
          cvData?.data?.Works,
          FIELDS_CVWorks.work_EndDate,
        );
      }
      // Preprocess data (if expirationDate is null, change it to empty string)
      let certifications: JobSeekerCVCertificationType[] = [];
      if (cvData.data.Certifications) {
        certifications = preprocessFetchedData(
          cvData?.data?.Certifications,
          FIELDS_CVCertification.ExpirationDate,
        );
      }

      reset({
        id: cvData.data.id,
        firstName: cvData.data.firstName,
        lastName: cvData.data.lastName,
        email: cvData.data.email,
        phone: cvData.data.phone,
        linkedin: cvData.data.linkedin,
        country: cvData.data.country,
        region: cvData.data.region,
        city: cvData.data.city,
        Education: educations,
        Works: works,
        Certifications: certifications,
      });
    }
  }, [cvData]);

  //Prepare Accordion Status (the circle color)
  const sharedStatusParams = {
    touchedFields: touchedFields,
    errors: errors,
    isBackendData, // new form data, or prefilled from backend data?
  };
  // Accordion status for Profile
  const ProfileAccordionFields = {
    fields: [
      FIELDS_CVForm.firstName,
      FIELDS_CVForm.lastName,
      FIELDS_CVForm.email,
      FIELDS_CVForm.phone,
      FIELDS_CVForm.linkedin,
      FIELDS_CVForm.country,
      FIELDS_CVForm.region,
      FIELDS_CVForm.city,
    ],
  };

  // Accordion status for Education History
  const EducationAccordionFields = {
    fields: [FIELDS_CVForm.Education],
  };

  // Accordion status for Work History
  const WorkAccordionFields = {
    fields: [FIELDS_CVForm.Works],
  };

  // Accordion status for Certifications
  const CertificationAccordionFields = {
    fields: [FIELDS_CVForm.Certifications],
  };

  const [
    ProfileAccordionStatus,
    EducationsAccordionStatus,
    WorksAccordionStatus,
    CertificationsAccordionStatus,
  ] = useAccordionStatus<JobSeekerCVFormType>(sharedStatusParams, [
    ProfileAccordionFields,
    EducationAccordionFields,
    WorkAccordionFields,
    CertificationAccordionFields,
  ]);

  const submitHandler = async (data: JobSeekerCVFormType) => {
    //console.log(">>>>Submitting, handler data: ", data);
    try {
      const isDirty = Object.keys(dirtyFields).length > 0;
      if (!isDirty) {
        notifyAndRoute("No changes to save.", NOTIFICATION_STYLE.SUCCESS, "");
        scrollToTop();
      }
      if (isValid && isDirty) {
        // Preprocess data before post to backend regarding dates
        preprocessSubmitionData(data);
        await postCV({
          id: authUser.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          linkedin: data.linkedin,
          country: data.country,
          region: data.region,
          city: data.city,
          Education: data.Education || [],
          Works: data.Works || [],
          Certifications: data.Certifications || [],
        }).unwrap();
        notifyAndRoute(
          "Your C.V. is saved successfully.",
          NOTIFICATION_STYLE.SUCCESS,
          "/job-seeker",
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

  const errorHandler = (error: any) => {
    console.log(">>> errorHandler errors: ", error);
  };

  const aiFeedbackHandler = async (data: JobSeekerCVFormType) => {
    try {
      //console.log(">>>> data: ", data);
      if (isValid) {
        // Preprocess data before post to backend regarding dates
        const processedData: AiFeedbackPorcessedData =
          preprocessAiFeedbackRequestData(data);
        const resData: ResponseAiFeedbackCV = await postAiFeedback(
          processedData.reqData,
        ).unwrap();
        setAiFeedbackIndexes({
          eduStartIndex: processedData.eduStartIndex,
          workStartIndex: processedData.workStartIndex,
          certStartIndex: processedData.certStartIndex,
        });
        // console.log(">>>> eduStartIndex: ", processedData.eduStartIndex);
        // console.log(">>>> workStartIndex: ", processedData.workStartIndex);
        // console.log(">>>> certStartIndex: ", processedData.certStartIndex);
        // console.log(">>>> resData: ", resData);
        setAiFeedbackMessages(resData);
      }
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  if (isError || aiError) {
    console.error(error || aiError);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useSpinner([isLoading, aiIsLoading]);

  return (
    <Section title="Your C.V.">
      <Form onSubmit={handleSubmit(submitHandler, errorHandler)}>
        <Accordion>
          <AccordionItem
            id="Profile"
            title="Profile"
            status={ProfileAccordionStatus}
          >
            <ProfileForm
              initialValues={initialValues}
              errors={errors}
              register={register}
              setValue={setValue}
              trigger={trigger}
              getValues={getValues}
            />
          </AccordionItem>
          <AccordionItem
            id="Educations"
            title="Education History"
            status={EducationsAccordionStatus}
          >
            <EducationForms
              initialValues={initialValues}
              isBackendData={isBackendData}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              getValues={getValues}
              trigger={trigger}
              aiFeedbackMessages={aiFeedbackMessages?.data}
              startIndexAiFeedbackMessage={aiFeedbackIndexes?.eduStartIndex}
            />
          </AccordionItem>
          <AccordionItem
            id="Works"
            title="Work History"
            status={WorksAccordionStatus}
          >
            <WorkForms
              initialValues={initialValues}
              isBackendData={isBackendData}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              getValues={getValues}
              trigger={trigger}
              watch={watch}
              aiFeedbackMessages={aiFeedbackMessages?.data}
              startIndexAiFeedbackMessage={aiFeedbackIndexes?.workStartIndex}
            />
          </AccordionItem>
          <AccordionItem
            id="Certifications"
            title="Certifications"
            status={CertificationsAccordionStatus}
          >
            <CertificationsForm
              initialValues={initialValues}
              isBackendData={isBackendData}
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              getValues={getValues}
              trigger={trigger}
              aiFeedbackMessages={aiFeedbackMessages?.data}
              startIndexAiFeedbackMessage={aiFeedbackIndexes?.certStartIndex}
            />
          </AccordionItem>
        </Accordion>
        {/* Buttons */}
        <GroupButtons classes="d-flex justify-content-between mt-4">
          <Button
            type="button"
            label="Get AI Suggestions"
            classes="btn btn-primary"
            onClick={handleSubmit(aiFeedbackHandler)}
            disabled={!isValid}
          />
          <GroupButtons classes="d-flex justify-content-end">
            <CancelButton url="/job-seeker" />
            <Button type="submit" label="Save" classes="btn btn-primary" />
          </GroupButtons>
        </GroupButtons>
      </Form>
    </Section>
  );
};

export default CVForm;

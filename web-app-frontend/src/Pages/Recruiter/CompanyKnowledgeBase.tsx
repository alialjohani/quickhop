/**
 * CompanyKnowledgeBase.tsx
 *
 * Recruiter can view/update the company knowledge base.
 */

import React, { useEffect } from "react";
import Section from "../../components/common/Section/Section";
import Form from "../../components/common/Form/Form";
import Input from "../../components/common/Form/Input";
import CancelButton from "../../components/common/Form/CancelButton";
import Button from "../../components/common/Form/Button";
import GroupButtons from "../../components/common/Form/GroupButtons";
import useReactHookForm from "../../hooks/useReactHookForm";
import { NOTIFICATION_STYLE } from "../../common/constants";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";
import {
  useGetRecruiterCompanyQuery,
  useUpdateRecruiterCompanyMutation,
} from "../../app/slices/apiSlice";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";

interface FormDataType {
  name: string;
  kb: string;
}

const CompanyKnowledgeBase = () => {
  const userId = useAppSeclector(authUserIdSelector);
  const {
    data: companyData,
    isLoading,
    isError,
    error,
  } = useGetRecruiterCompanyQuery(userId);

  const [updateCompany] = useUpdateRecruiterCompanyMutation();
  const notifyAndRoute = useNotifyAndRoute();

  const initialValues: FormDataType = {
    name: "",
    kb: "",
  };

  // with useReactHookForm: order of fields are important
  const { handleSubmit, errors, isValid, dirtyFields, register, reset } =
    useReactHookForm<FormDataType>(initialValues);

  // Get backend data
  useEffect(() => {
    const transformedData: FormDataType = {
      name: companyData?.data.name || "",
      kb: companyData?.data.knowledge_base || "",
    };
    reset(transformedData);
  }, [companyData]);

  // Handling fetching data errors
  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  const submitHandler = async (data: FormDataType) => {
    // console.log("Form submitted: ", data);
    try {
      await updateCompany({
        recruiterId: userId,
        knowledge_base: data.kb,
      }).unwrap();
      notifyAndRoute(
        "Your company knowledge base is updated successfully.",
        NOTIFICATION_STYLE.SUCCESS,
        "/recruiter",
      );
    } catch (error) {
      console.error(error);
      notifyAndRoute(
        "", // using default error message
        NOTIFICATION_STYLE.ERROR,
      );
    }
  };

  useSpinner([isLoading]);

  return (
    <Section title="Update Company Knowledge Base">
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Input
          id="name"
          label="Company Name"
          type="text"
          errorMessage={errors.name?.message}
          registerObject={register("name")}
          disabled
        />
        <Input
          id="kb"
          label="Knowledge Base"
          type="text"
          errorMessage={errors.kb?.message}
          registerObject={register("kb")}
          isTextArea
        />
        <GroupButtons>
          <CancelButton url="/recruiter" />
          <Button
            type="submit"
            label="Submit"
            classes="btn btn btn-primary"
            disabled={!isValid || !dirtyFields.kb}
          />
        </GroupButtons>
      </Form>
    </Section>
  );
};

export default CompanyKnowledgeBase;

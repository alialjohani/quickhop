/**
 * Profile.tsx
 *
 * Recruiter can change the password, or update the phone number.
 */
import React, { useEffect } from "react";
import Form from "../../components/common/Form/Form";
import Input from "../../components/common/Form/Input";
import { NOTIFICATION_STYLE } from "../../common/constants";
import {
  VALIDATION_PHONE,
  getVALIDATION_STRING,
} from "../../common/formsValidations";
import useReactHookForm from "../../hooks/useReactHookForm";
import Button from "../../components/common/Form/Button";
import Section from "../../components/common/Section/Section";
import CancelButton from "../../components/common/Form/CancelButton";
import GroupButtons from "../../components/common/Form/GroupButtons";
import useNotifyAndRoute from "../../hooks/useNotifyAndRoute";

import {
  useGetRecruiterProfileQuery,
  useUpdateRecruiterProfileMutation,
} from "../../app/slices/apiSlice";
import { useAppSeclector } from "../../app/store/store";
import { authUserIdSelector } from "../../app/slices/authSlice";
import useSpinner from "../../hooks/useSpinner";

interface FormDataType {
  email: string;
  companyName: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const Profile = () => {
  const notifyAndRoute = useNotifyAndRoute();

  const userId: number = useAppSeclector(authUserIdSelector);
  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useGetRecruiterProfileQuery(userId);

  const [updateProfile] = useUpdateRecruiterProfileMutation();

  const initialValues: FormDataType = {
    email: "",
    companyName: "",
    firstName: "",
    lastName: "",
    phone: "",
  };

  // with useReactHookForm: order of fields are important
  const { handleSubmit, errors, isValid, dirtyFields, register, reset } =
    useReactHookForm<FormDataType>(initialValues);

  // Get backend data
  useEffect(() => {
    const transformedData: FormDataType = {
      email: profileData?.data.email || "",
      companyName: profileData?.data.companyName || "",
      firstName: profileData?.data.firstName || "",
      lastName: profileData?.data.lastName || "",
      phone: profileData?.data.phone || "",
    };
    reset(transformedData);
  }, [profileData]);

  const submitHandler = async (data: FormDataType) => {
    // console.log(">>> Form submitted: ", data);
    try {
      // update backend
      await updateProfile({
        recruiterId: userId,
        companyName: data.companyName,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }).unwrap();
      // Confirm Message
      notifyAndRoute(
        "Your profile data is updated successfully.",
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

  // Handle any fetching data errors
  if (isError) {
    console.error(error);
    notifyAndRoute(
      "", // using default error message
      NOTIFICATION_STYLE.ERROR,
    );
  }

  useSpinner([isLoading]);

  return (
    <Section title="Update Profile Data">
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Input
          id="companyName"
          label="Company Name"
          type="text"
          errorMessage={errors.companyName?.message}
          registerObject={register("companyName")}
          disabled
        />
        <Input
          id="email"
          label="Email"
          type="email"
          errorMessage={errors.email?.message}
          registerObject={register("email")}
          disabled
        />
        <Input
          id="firstName"
          label="First Name"
          type="text"
          errorMessage={errors.firstName?.message}
          registerObject={register(
            "firstName",
            getVALIDATION_STRING("firstName", 3, 30),
          )}
        />
        <Input
          id="lastName"
          label="Last Name"
          type="text"
          errorMessage={errors.lastName?.message}
          registerObject={register(
            "lastName",
            getVALIDATION_STRING("lastName", 3, 30),
          )}
        />
        <Input
          id="phone"
          label="Phone"
          type="text"
          errorMessage={errors.phone?.message}
          registerObject={register("phone", VALIDATION_PHONE)}
        />
        <GroupButtons>
          <CancelButton url="/recruiter" />
          <Button
            type="submit"
            label="Submit"
            classes="btn btn btn-primary"
            disabled={
              !isValid ||
              !(
                dirtyFields.firstName ||
                dirtyFields.lastName ||
                dirtyFields.phone
              )
            }
          />
        </GroupButtons>
      </Form>
    </Section>
  );
};

export default Profile;

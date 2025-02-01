/**
 * RecruiterLoginFrom.tsx
 *
 * Login form for recruiter. It is used inside the login modal.
 */

import React, { useCallback } from "react";
import { FieldErrors } from "react-hook-form";
import Input from "../Form/Input";
import Form from "../Form/Form";
import Button from "../Form/Button";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/store/store";
import { closeModal } from "../../../app/slices/modalSlice";
import useReactHookForm from "../../../hooks/useReactHookForm";
import {
  getVALIDATION_STRING,
  VALIDATION_EMAIL,
  VALIDATION_PASSWORD,
} from "../../../common/formsValidations";

interface FormDataType {
  email: string;
  password: string;
  company: string;
}

const RecruiterLoginFrom = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const initalValues: FormDataType = {
    email: "",
    password: "",
    company: "",
  };

  // with useReactHookForm: order of fields are important
  const { handleSubmit, errors, register } = useReactHookForm(initalValues);

  const closeModalCB = useCallback(() => {
    dispatch(closeModal());
  }, []);

  const submitHandler = (data: FormDataType) => {
    console.log("Form submitted: ", data);
    //>> verify login, close modal, then route
    closeModalCB();
    navigate("/recruiter");
  };

  const errorHandler = (errors: FieldErrors<FormDataType>) => {
    console.log("Form errors: ", errors);
  };

  return (
    <Form onSubmit={handleSubmit(submitHandler, errorHandler)} noBorder>
      <Input
        id="email"
        label="Email"
        type="email"
        errorMessage={errors.email?.message}
        registerObject={register("email", VALIDATION_EMAIL)}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        errorMessage={errors.password?.message}
        registerObject={register("password", VALIDATION_PASSWORD)}
      />
      <Input
        id="company"
        label="Company"
        type="company"
        errorMessage={errors.company?.message}
        registerObject={register("company", getVALIDATION_STRING("Company"))}
      />
      <div className="text-end g-2 pt-2 pb-0">
        <Button
          label="Close"
          classes="btn btn-outline-secondary me-2"
          onClick={closeModalCB}
        />
        <Button label=" Sign in" classes="btn btn btn-primary" type="submit" />
      </div>
    </Form>
  );
};

export default RecruiterLoginFrom;

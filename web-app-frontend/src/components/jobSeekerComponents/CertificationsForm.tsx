import React, { useEffect, useState } from "react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  UseFormTrigger,
  RegisterOptions,
} from "react-hook-form";
import Button from "../common/Form/Button";
import Input from "../common/Form/Input";
import {
  JobSeekerCVFormType,
  JobSeekerCVCertificationType,
} from "../../common/types";
import Checkbox from "../common/Form/Checkbox";
import DatePicker from "../common/DatePicker/DatePicker";

import {
  onDateChangeTriggerValidation,
  getVALIDATION_DATE,
  getVALIDATION_STRING,
} from "../../common/formsValidations";

import AiFeedbackMessage from "../common/Form/AiFeedbackMessage";
import { FIELDS_CVCertification } from "../../common/constants";

interface PropsType {
  initialValues: JobSeekerCVFormType;
  isBackendData: boolean;
  errors: FieldErrors<JobSeekerCVFormType>;
  control: Control<JobSeekerCVFormType>;
  register: UseFormRegister<JobSeekerCVFormType>;
  setValue: UseFormSetValue<JobSeekerCVFormType>;
  getValues: UseFormGetValues<JobSeekerCVFormType>;
  trigger: UseFormTrigger<JobSeekerCVFormType>;
  aiFeedbackMessages: string[] | undefined;
  startIndexAiFeedbackMessage: number;
}
const newFormValues: JobSeekerCVCertificationType = {
  id: 0,
  name: "",
  issuingOrganization: "",
  credentialUrl: "",
  description: "",
  noExpirationDate: false,
  issueDate: "",
  expirationDate: "",
};
const URL_PATTERN =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

const CertificationsForm = ({
  //initialValues,
  isBackendData,
  register,
  control,
  errors,
  setValue,
  getValues,
  trigger,
  aiFeedbackMessages,
  startIndexAiFeedbackMessage,
}: PropsType) => {
  const [index, setIndex] = useState(-1);
  const [clickWorking, setClickWorking] = useState(false);

  const { fields, append, remove } = useFieldArray({
    name: FIELDS_CVCertification.certifications,
    control: control,
  });

  const addCertificationFormHandler = () => {
    append(newFormValues);
  };

  const removeWorkFormHandler = (index: number) => {
    remove(index);
  };

  // Update EndDate validation based on IsEnrolled Checkbox click
  const checkboxHandler = (index: number) => {
    setIndex(index);
    setClickWorking((prev) => !prev);
  };

  // Update Dates validation errors based on IsWorking Checkbox click
  useEffect(() => {
    setValue(
      `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
      "",
    );
    trigger(
      `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`,
    );
    trigger(
      `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
    );
  }, [index, clickWorking]);

  return (
    <>
      {fields.map((field, index) => {
        const initStartDate = isBackendData
          ? getValues(FIELDS_CVCertification.certifications)[index].issueDate
          : newFormValues.issueDate;

        const initEndDate: string = isBackendData
          ? (getValues(FIELDS_CVCertification.certifications)[index]
              .expirationDate ?? "")
          : (newFormValues.expirationDate ?? "");

        return (
          <div key={field.id}>
            <div className="container border p-4 mb-3">
              <Button
                label="- Remove"
                classes="btn btn-outline-danger"
                onClick={() => removeWorkFormHandler(index)}
              />
              <Input
                label="Certification Name"
                id={FIELDS_CVCertification.Name}
                errorMessage={
                  errors?.[FIELDS_CVCertification.certifications]?.[index]?.[
                    FIELDS_CVCertification.Name
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.Name}`,
                  getVALIDATION_STRING("Certification name"),
                )}
              />
              <Input
                label="Issuing Organization"
                id={FIELDS_CVCertification.IssuingOrganization}
                errorMessage={
                  errors?.[FIELDS_CVCertification.certifications]?.[index]?.[
                    FIELDS_CVCertification.IssuingOrganization
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssuingOrganization}`,
                  getVALIDATION_STRING("Issuing organization"),
                )}
              />
              <DatePicker<JobSeekerCVFormType>
                field={`${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`}
                label="Issue Date"
                setValue={setValue}
                errorMessage={
                  errors?.[FIELDS_CVCertification.certifications]?.[index]?.[
                    FIELDS_CVCertification.IssueDate
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`,
                  getVALIDATION_DATE<JobSeekerCVFormType>(
                    getValues,
                    "START_DATE",
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
                  ),
                )}
                initialDate={initStartDate}
                isRestrictedForFutureDates={false}
                onChange={() =>
                  onDateChangeTriggerValidation<JobSeekerCVFormType>(
                    "START_DATE",
                    trigger,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
                  )
                }
              />
              <DatePicker<JobSeekerCVFormType>
                field={`${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`}
                label="Expiration Date"
                setValue={setValue}
                errorMessage={
                  errors?.[FIELDS_CVCertification.certifications]?.[index]?.[
                    FIELDS_CVCertification.ExpirationDate
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
                  getVALIDATION_DATE<JobSeekerCVFormType>(
                    getValues,
                    "END_DATE",
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.noExpirationDate}`,
                  ) as RegisterOptions<
                    JobSeekerCVFormType,
                    `${FIELDS_CVCertification.certifications}.${number}.${FIELDS_CVCertification.ExpirationDate}`
                  >,
                )}
                initialDate={initEndDate}
                isRestrictedForFutureDates={false}
                onChange={() =>
                  onDateChangeTriggerValidation<JobSeekerCVFormType>(
                    "END_DATE",
                    trigger,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.IssueDate}`,
                    `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.ExpirationDate}`,
                  )
                }
              />
              <Checkbox
                label="No expiration date?"
                id={`${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.noExpirationDate}`}
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.noExpirationDate}`,
                )}
                onClick={() => checkboxHandler(index)}
              />
              <Input
                label="Credential URL"
                id={FIELDS_CVCertification.CredentialUrl}
                errorMessage={
                  errors?.[FIELDS_CVCertification.certifications]?.[index]?.[
                    FIELDS_CVCertification.CredentialUrl
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.CredentialUrl}`,
                  {
                    pattern: {
                      value: URL_PATTERN,
                      message:
                        "Please enter a valid URL that starts with http:// or https://",
                    },
                  },
                )}
              />
              <Input
                label="Description"
                id={FIELDS_CVCertification.Description}
                errorMessage={
                  errors?.[FIELDS_CVCertification.certifications]?.[index]?.[
                    FIELDS_CVCertification.Description
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVCertification.certifications}.${index}.${FIELDS_CVCertification.Description}`,
                  getVALIDATION_STRING("Description", 3, 400),
                )}
                isTextArea
              />
            </div>
            {aiFeedbackMessages && (
              <AiFeedbackMessage
                message={
                  aiFeedbackMessages[startIndexAiFeedbackMessage + index]
                }
              />
            )}
          </div>
        );
      })}
      <Button
        type="button"
        label="+ Add Certification"
        classes="btn btn-outline-primary border-0"
        onClick={addCertificationFormHandler}
      />
    </>
  );
};

export default CertificationsForm;

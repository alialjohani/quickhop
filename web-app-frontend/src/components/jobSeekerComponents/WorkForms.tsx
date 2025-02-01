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
import { JobSeekerCVFormType, JobSeekerCVWorkType } from "../../common/types";
import Checkbox from "../common/Form/Checkbox";
import DatePicker from "../common/DatePicker/DatePicker";

import {
  onDateChangeTriggerValidation,
  getVALIDATION_DATE,
  getVALIDATION_STRING,
} from "../../common/formsValidations";
import AiFeedbackMessage from "../common/Form/AiFeedbackMessage";
import { FIELDS_CVWorks } from "../../common/constants";

interface PropsType {
  initialValues: JobSeekerCVFormType;
  isBackendData: boolean;
  errors: FieldErrors<JobSeekerCVFormType>;
  control: Control<JobSeekerCVFormType>;
  register: UseFormRegister<JobSeekerCVFormType>;
  setValue: UseFormSetValue<JobSeekerCVFormType>;
  getValues: UseFormGetValues<JobSeekerCVFormType>;
  trigger: UseFormTrigger<JobSeekerCVFormType>;
  watch: UseFormRegister<JobSeekerCVFormType>;
  aiFeedbackMessages: string[] | undefined;
  startIndexAiFeedbackMessage: number;
}

const newFormValues: JobSeekerCVWorkType = {
  id: 0,
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  isStillWorking: false,
  description: "",
};

const WorkForms = ({
  // initialValues,
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
    name: FIELDS_CVWorks.works,
    control: control,
  });

  // Update EndDate validation based on IsEnrolled Checkbox click
  const checkboxHandler = (index: number) => {
    setIndex(index);
    setClickWorking((prev) => !prev);
  };

  // Update Dates validation errors based on IsWorking Checkbox click
  useEffect(() => {
    setValue(
      `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`,
      "",
    );
    trigger(
      `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`,
    );
    trigger(`${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`);
  }, [index, clickWorking]);

  const addWorkFormHandler = () => {
    append(newFormValues);
  };

  const removeWorkFormHandler = (index: number) => {
    remove(index);
  };

  return (
    <>
      {fields.map((field, index) => {
        const initStartDate = isBackendData
          ? getValues(FIELDS_CVWorks.works)[index].startDate
          : newFormValues.startDate;
        const initEndDate: string = isBackendData
          ? (getValues(FIELDS_CVWorks.works)[index].endDate ?? "")
          : (newFormValues.endDate ?? "");
        return (
          <div key={field.id}>
            <div className="container border p-4 mb-3">
              <Button
                label="- Remove"
                classes="btn btn-outline-danger"
                onClick={() => removeWorkFormHandler(index)}
              />
              <Input
                label="Job Title"
                id={FIELDS_CVWorks.work_JobTitle}
                errorMessage={
                  errors?.[FIELDS_CVWorks.works]?.[index]?.[
                    FIELDS_CVWorks.work_JobTitle
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_JobTitle}`,
                  getVALIDATION_STRING("Job title"),
                )}
              />
              <Input
                label="Company Name"
                id={FIELDS_CVWorks.work_CompanyName}
                errorMessage={
                  errors?.[FIELDS_CVWorks.works]?.[index]?.[
                    FIELDS_CVWorks.work_CompanyName
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_CompanyName}`,
                  getVALIDATION_STRING("Company name"),
                )}
              />
              <Input
                label="Location"
                id={FIELDS_CVWorks.work_Location}
                errorMessage={
                  errors?.[FIELDS_CVWorks.works]?.[index]?.[
                    FIELDS_CVWorks.work_Location
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_Location}`,
                  getVALIDATION_STRING("Location"),
                )}
              />
              <DatePicker<JobSeekerCVFormType>
                field={`${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`}
                label="Start Date"
                setValue={setValue}
                errorMessage={
                  errors?.[FIELDS_CVWorks.works]?.[index]?.[
                    FIELDS_CVWorks.work_StartDate
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`,
                  getVALIDATION_DATE<JobSeekerCVFormType>(
                    getValues,
                    "START_DATE",
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`,
                  ),
                )}
                initialDate={initStartDate}
                isRestrictedForFutureDates={false}
                onChange={() =>
                  onDateChangeTriggerValidation<JobSeekerCVFormType>(
                    "START_DATE",
                    trigger,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`,
                  )
                }
              />
              <DatePicker<JobSeekerCVFormType>
                field={`${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`}
                label="End Date"
                setValue={setValue}
                errorMessage={
                  errors?.[FIELDS_CVWorks.works]?.[index]?.[
                    FIELDS_CVWorks.work_EndDate
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`,
                  getVALIDATION_DATE<JobSeekerCVFormType>(
                    getValues,
                    "END_DATE",
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_IsWorking}`,
                  ) as RegisterOptions<
                    JobSeekerCVFormType,
                    `${FIELDS_CVWorks.works}.${number}.${FIELDS_CVWorks.work_EndDate}`
                  >,
                )}
                initialDate={initEndDate}
                isRestrictedForFutureDates={false}
                onChange={() =>
                  onDateChangeTriggerValidation<JobSeekerCVFormType>(
                    "END_DATE",
                    trigger,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_StartDate}`,
                    `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_EndDate}`,
                  )
                }
              />
              <Checkbox
                label="Are you currently employed in this position?"
                id={`${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_IsWorking}`}
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_IsWorking}`,
                )}
                onClick={() => checkboxHandler(index)}
              />
              <Input
                label="Description"
                id={FIELDS_CVWorks.work_Description}
                errorMessage={
                  errors?.[FIELDS_CVWorks.works]?.[index]?.[
                    FIELDS_CVWorks.work_Description
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVWorks.works}.${index}.${FIELDS_CVWorks.work_Description}`,
                  getVALIDATION_STRING("Description", 3, 800),
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
        label="+ Add Work"
        classes="btn btn-outline-primary border-0"
        onClick={addWorkFormHandler}
      />
    </>
  );
};

export default WorkForms;

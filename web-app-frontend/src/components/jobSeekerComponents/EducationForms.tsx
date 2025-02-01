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
  JobSeekerCVEductionType,
  JobSeekerCVFormType,
} from "../../common/types";
import Checkbox from "../common/Form/Checkbox";
import DatePicker from "../common/DatePicker/DatePicker";
import {
  getVALIDATION_STRING,
  getVALIDATION_DATE,
  onDateChangeTriggerValidation,
} from "../../common/formsValidations";
import AiFeedbackMessage from "../common/Form/AiFeedbackMessage";
import { FIELDS_CVEducations } from "../../common/constants";

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

const newFormValues: JobSeekerCVEductionType = {
  id: 0,
  school: "",
  location: "",
  startDate: "",
  endDate: "",
  isEnrolled: false,
  degree: "",
  fieldOfStudy: "",
  description: "",
};

const EducationForms = ({
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
  const [clickEnrolled, setClickEnrolled] = useState(false);

  const { fields, append, remove } = useFieldArray({
    name: FIELDS_CVEducations.Education,
    control: control,
  });

  // Update EndDate validation based on IsEnrolled Checkbox click
  const checkboxHandler = (index: number) => {
    setIndex(index);
    setClickEnrolled((prev) => !prev);
  };

  // Update EndDate validation based on IsEnrolled Checkbox click
  useEffect(() => {
    setValue(
      `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
      "",
    );
    trigger(
      `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
    );
  }, [index, clickEnrolled]);

  const addEducationFormHandler = () => {
    append(newFormValues);
  };

  const removeEducationFormHandler = (index: number) => {
    remove(index);
  };

  return (
    <>
      {fields.map((field, index) => {
        const initStartDate = isBackendData
          ? getValues(FIELDS_CVEducations.Education)[index].startDate
          : newFormValues.startDate;
        const initEndDate: string = isBackendData
          ? (getValues(FIELDS_CVEducations.Education)[index].endDate ?? "")
          : (newFormValues.endDate ?? "");
        return (
          <div key={field.id}>
            <div className="container border p-4 mb-3">
              <Button
                label="- Remove"
                classes="btn btn-outline-danger"
                onClick={() => removeEducationFormHandler(index)}
              />
              <Input
                label="School Name"
                id={FIELDS_CVEducations.educations_School}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_School
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_School}`,
                  getVALIDATION_STRING("School name"),
                )}
              />
              <Input
                label="School Location"
                id={FIELDS_CVEducations.educations_Location}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_Location
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_Location}`,
                  getVALIDATION_STRING("Location"),
                )}
              />
              <DatePicker<JobSeekerCVFormType>
                field={`${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_StartDate}`}
                label="Start Date"
                setValue={setValue}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_StartDate
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_StartDate}`,
                  getVALIDATION_DATE<JobSeekerCVFormType>(
                    getValues,
                    "START_DATE",
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_StartDate}`,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
                  ),
                )}
                initialDate={initStartDate}
                isRestrictedForFutureDates={false}
                onChange={() =>
                  onDateChangeTriggerValidation<JobSeekerCVFormType>(
                    "START_DATE",
                    trigger,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_StartDate}`,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
                  )
                }
              />
              <DatePicker<JobSeekerCVFormType>
                field={`${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`}
                label="End Date"
                setValue={setValue}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_EndDate
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
                  getVALIDATION_DATE<JobSeekerCVFormType>(
                    getValues,
                    "END_DATE",
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_StartDate}`,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_IsEnrolled}`,
                  ) as RegisterOptions<
                    JobSeekerCVFormType,
                    `${FIELDS_CVEducations.Education}.${number}.${FIELDS_CVEducations.educations_EndDate}`
                  >,
                )}
                initialDate={initEndDate}
                isRestrictedForFutureDates={false}
                onChange={() =>
                  onDateChangeTriggerValidation<JobSeekerCVFormType>(
                    "END_DATE",
                    trigger,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_StartDate}`,
                    `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_EndDate}`,
                  )
                }
              />
              <Checkbox
                label="Is currently enrolled?"
                id={`${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_IsEnrolled}`}
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_IsEnrolled}`,
                )}
                onClick={() => checkboxHandler(index)}
              />
              <Input
                label="Degree"
                id={FIELDS_CVEducations.educations_Degree}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_Degree
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_Degree}`,
                  getVALIDATION_STRING("Degree"),
                )}
              />
              <Input
                label="Field of Study"
                id={FIELDS_CVEducations.educations_FieldStudy}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_FieldStudy
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_FieldStudy}`,
                  getVALIDATION_STRING("Field of study"),
                )}
              />
              <Input
                label="Description"
                id={FIELDS_CVEducations.educations_Description}
                errorMessage={
                  errors?.[FIELDS_CVEducations.Education]?.[index]?.[
                    FIELDS_CVEducations.educations_Description
                  ]?.message
                }
                registerObject={register(
                  `${FIELDS_CVEducations.Education}.${index}.${FIELDS_CVEducations.educations_Description}`,
                  getVALIDATION_STRING("Description", 3, 600),
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
        label="+ Add Education"
        classes="btn btn-outline-primary border-0"
        onClick={addEducationFormHandler}
      />
    </>
  );
};

export default EducationForms;

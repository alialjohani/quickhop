import React, { useEffect, useState } from "react";
import Button from "../common/Form/Button";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  ArrayPath,
  UseFormTrigger,
  UseFormGetValues,
} from "react-hook-form";
import {
  RecruiterJobPostFormType,
  RecruiterJobPostInteviewQuestionType,
} from "../../common/types";
import ErrorMessage from "../common/Form/ErrorMessage";
import {
  usePostIsOpenEndQuestionMutation,
  usePostRecruiterInterviewQuestionsMutation,
} from "../../app/slices/apiSlice";
import { cleanText } from "../../common/utils";
import useSpinner from "../../hooks/useSpinner";
import { FIELDS_PostForm } from "../../common/constants";

interface PropsType {
  errors: FieldErrors<RecruiterJobPostFormType>;
  control: Control<RecruiterJobPostFormType>;
  register: UseFormRegister<RecruiterJobPostFormType>;
  fieldName: ArrayPath<RecruiterJobPostFormType>;
  //nestedFieldName: Path<RecruiterJobPostInteviewQuestionType>;
  trigger: UseFormTrigger<RecruiterJobPostFormType>;
  getValues: UseFormGetValues<RecruiterJobPostFormType>;
  disabled?: boolean;
}

const TOTAL_QUESTIONS = 5;

const GenAiInterviewQuestions = ({
  register,
  control,
  errors,
  fieldName,
  trigger,
  getValues,
  disabled,
}: PropsType) => {
  //To check if question is open end which is not supported; Questions must be of the type short-answer questions
  const [
    isOpenEndQuestion,
    { isLoading: isLoadingOpenEndQuestion, error: errorOpenEndQuestion },
  ] = usePostIsOpenEndQuestionMutation();
  // error message if required fields are not filled before requesting backend
  const [customError, setCustomError] = useState<string | null>(null);
  const [manualQuestion, setManualQuestion] = useState<string>("");
  const [manualQuestionError, setManualQuestionError] = useState<string | null>(
    null,
  );
  const [questions, setQustions] = useState<
    RecruiterJobPostInteviewQuestionType[] | null
  >(null);
  const [postRequest, { isLoading, isSuccess, error }] =
    usePostRecruiterInterviewQuestionsMutation();

  const { fields, append, remove } = useFieldArray({
    name: fieldName,
    control: control,
  });

  const removeQuestion = (index: number) => {
    remove(index);
    trigger(fieldName);
  };

  // Query backend endpoint handler
  const generateQuestions = async () => {
    const jobTitle = getValues(FIELDS_PostForm.jobTitle);
    const jobDescription = getValues(FIELDS_PostForm.jobDescription);
    const jobResponsibility = getValues(FIELDS_PostForm.jobResponsibility);
    const requiredQualification =
      getValues(FIELDS_PostForm.requiredQualification) || "";
    const preferredQualification =
      getValues(FIELDS_PostForm.preferredQualification) || "";
    if (!jobTitle || !jobDescription || !jobResponsibility) {
      setCustomError(
        "Please enter the job title, description, and responsibilities before proceeding.",
      );
    } else {
      setCustomError(null);
      // replace([]);
      const tmpQuestions: string[] = [];
      fields.forEach((field) => tmpQuestions.push(field.question));
      const response = await postRequest({
        totalQuestions: TOTAL_QUESTIONS - fields.length,
        questions: tmpQuestions,
        jobTitle: cleanText(jobTitle),
        jobDescription: cleanText(jobDescription),
        jobResponsibility: cleanText(jobResponsibility),
        requiredQualification: cleanText(requiredQualification),
        preferredQualification: cleanText(preferredQualification),
      });
      if (response.data && !error) {
        setQustions(response.data.data);
      }
      if (error) {
        setCustomError(
          "We are unable to process your request at the moment. Please try again later.",
        );
      }
    }
  };

  // After the data fetched from backend
  useEffect(() => {
    if (questions && isSuccess) {
      questions.forEach((question) => {
        append(question);
      });
      trigger(fieldName);
      setQustions(null);
    }
  }, [questions]);

  const manualQuestionHandler = async () => {
    try {
      if (fields.length > TOTAL_QUESTIONS) {
        setManualQuestionError(
          "The maximum number of questions is " + TOTAL_QUESTIONS,
        );
      } else if (manualQuestion === "") {
        setManualQuestionError("Please enter your question.");
      } else {
        const response = await isOpenEndQuestion(manualQuestion).unwrap();
        if (errorOpenEndQuestion) {
          console.error(errorOpenEndQuestion);
        }
        if (response.data === true) {
          // This is an open end question that is not supported
          setManualQuestionError(
            "Please rephrase this as a short-answer question. Open-ended questions are not supported in phone interviews.",
          );
        } else {
          append({
            question: manualQuestion,
          });
          setManualQuestion("");
          setManualQuestionError("");
          trigger(fieldName);
        }
      }
    } catch (error) {
      console.error("manualQuestionHandler() error: ", error);
    }
  };

  useSpinner([isLoading, isLoadingOpenEndQuestion]);

  return (
    <div>
      <p className="text-danger">{customError}</p>
      <p className="text-danger">{errors?.[fieldName]?.root?.message}</p>
      <div className="container">
        <div
          {...register(fieldName, {
            required: {
              value: true,
              message:
                "Please assure that there will be at least one question for the call interview.",
            },
          })}
        >
          <p>
            Add the interview questions that the AI will ask the candidate
            during the phone call.
            <br /> There is {fields.length} out of {TOTAL_QUESTIONS} questions.
          </p>
        </div>
        <hr />
        {fields.map((field, index) => {
          if (field.question) {
            return (
              <div key={index}>
                <div className="row align-items-center mt-4">
                  <label
                    htmlFor={`${field.id}`}
                    className="col-sm-2 col-form-label"
                  >
                    Question {(index + 1).toString()}:
                  </label>
                  <div className="col-sm-8">
                    <textarea
                      id={`${field.id}`}
                      className="form-control w-100"
                      value={field.question}
                      maxLength={100}
                      disabled={true}
                    />
                  </div>
                  <div className="col-sm-2">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeQuestion(index)}
                      disabled={disabled}
                    >
                      <i className="bi bi-dash-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        })}
        <hr />
        <div
          key={"manual-question-holder-1"}
          className="row align-items-center mt-4"
        >
          <label
            htmlFor={`manual-question-holder`}
            className="col-sm-2 col-form-label"
          >
            Add your question:
          </label>
          <div className="col-sm-8">
            <input
              id={`manual-question-holder`}
              className={`form-control ${manualQuestionError ? "is-invalid" : ""} `}
              maxLength={100}
              value={manualQuestion}
              onChange={(event) => setManualQuestion(event.target.value)}
              disabled={fields.length >= TOTAL_QUESTIONS || disabled}
            />
            {manualQuestionError && (
              <ErrorMessage message={manualQuestionError} />
            )}
          </div>
          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-success"
              onClick={manualQuestionHandler}
              disabled={fields.length >= TOTAL_QUESTIONS || disabled}
            >
              <i className="bi bi-plus-circle"></i>
            </button>
          </div>
        </div>
        <br />
        <Button
          label="+ Generate Questions by AI"
          classes="btn btn-outline-primary border-1"
          onClick={generateQuestions}
          disabled={fields.length >= TOTAL_QUESTIONS || disabled}
        />
      </div>
    </div>
  );
};

export default GenAiInterviewQuestions;

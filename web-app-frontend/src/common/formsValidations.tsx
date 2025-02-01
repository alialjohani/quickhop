import {
  FieldValues,
  Path,
  UseFormGetValues,
  UseFormTrigger,
} from "react-hook-form";

// Used mainly for react-hook-form
export interface ValidationOptions {
  required?: boolean | { value: boolean; message: string }; // Required can be a boolean or an object
  pattern?: { value: RegExp; message: string }; // Define pattern as an object
  minLength?: { value: number; message: string }; // Optionally, include other validation properties
  maxLength?: { value: number; message: string }; // Example for maxLength
  validate?: (param1: string, param2: FieldValues) => boolean | string;
  // You can include other properties from RegisterOptions as needed
}

// regex pattern to validate email format
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// regex pattern to validate north America phone numbers
export const PHONE_PATTERN = /^\+1\d{10}$/;

// Forms constraints for recruiter login
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 25;

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 80;

// function capitalizeFirstLetter(sentence: string) {
//   return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
// }

export const getVALIDATION_STRING = (
  fieldName: string,
  minLength = MIN_NAME_LENGTH,
  maxLength = MAX_NAME_LENGTH,
  customMessage?: string,
): ValidationOptions => {
  return {
    required: {
      value: true,
      message: customMessage
        ? customMessage
        : `Please enter a valid ${fieldName.toLocaleLowerCase()}.`,
    },
    minLength: {
      value: minLength,
      message: `${fieldName} must be at least ${minLength} characters.`,
    },
    maxLength: {
      value: maxLength,
      message: `${fieldName} must be less than ${maxLength} characters.`,
    },
  };
};

// Date Validations
export type DateTypes = "START_DATE" | "END_DATE";
export const getVALIDATION_DATE = <T extends FieldValues>(
  getValues: UseFormGetValues<T>,
  type: DateTypes,
  startDatePath: Path<T>,
  endDatePath: Path<T> | null,
  isIgnoredPath?: Path<T>, // Used with checkbox. For ex. isEnrolled or isWorking when checked so no need to check endDate
): ValidationOptions => ({
  validate: () => {
    const isIgnored = isIgnoredPath ? getValues(isIgnoredPath) : false;
    const startDate = getValues(startDatePath);

    if (isIgnored && type === "END_DATE") {
      // Make date as not required
      return true;
    }
    if (!startDate && type === "START_DATE") {
      // Required date
      return "Please enter the start date.";
    }
    if (endDatePath !== null) {
      const endDate = getValues(endDatePath);
      if (!endDate && type === "END_DATE") {
        // Required date
        return "Please enter the end date.";
      }
      if (!isIgnored && new Date(endDate) < new Date(startDate)) {
        const errorMessage =
          type === "START_DATE"
            ? "Please ensure the start date is earlier than the end date."
            : "Please ensure the end date is later than the start date.";

        return errorMessage; // Main message based on comparison between the two dates
      }
    }

    return true;
  },
});

export const onDateChangeTriggerValidation = <T extends FieldValues>(
  dateType: DateTypes,
  trigger: UseFormTrigger<T>,
  startDatePath: Path<T>,
  endDatePath: Path<T>,
) => {
  if (dateType === "START_DATE") {
    // Changed happened on startDate, check the endDate
    trigger(endDatePath);
  } else {
    trigger(startDatePath);
  }
};

export const VALIDATION_SELECT = {
  required: {
    value: true,
    message: "Please select one of the options in the dropdown list.",
  },
};

export const VALIDATION_PASSWORD: ValidationOptions = {
  required: {
    value: true,
    message: "Please enter your password.",
  },
  minLength: {
    value: MIN_PASSWORD_LENGTH,
    message: "Your password must be at least 6 characters.",
  },
  maxLength: {
    value: MAX_PASSWORD_LENGTH,
    message: "Your password must be less than 26 characters.",
  },
};

export const VALIDATION_PHONE: ValidationOptions = {
  required: {
    value: true,
    message: "Please enter your phone number",
  },
  pattern: {
    value: PHONE_PATTERN,
    message: "Please enter a valid phone number. Ex.: +1xxxxxxxxxx.",
  },
};

export const VALIDATION_EMAIL: ValidationOptions = {
  required: {
    value: true,
    message: "Please enter your email",
  },
  pattern: {
    value: EMAIL_PATTERN,
    message: "Please enter a valid email address.",
  },
};

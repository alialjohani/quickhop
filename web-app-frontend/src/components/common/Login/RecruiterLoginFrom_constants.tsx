import {
  VALIDATION_EMAIL,
  VALIDATION_PASSWORD,
  getVALIDATION_STRING,
} from "../../../common/formsValidations";

export const VALIDATIONS_RECRUITER_LOGIN_FORM = [
  VALIDATION_EMAIL,
  VALIDATION_PASSWORD,
  getVALIDATION_STRING("Company"), // for a company name
];

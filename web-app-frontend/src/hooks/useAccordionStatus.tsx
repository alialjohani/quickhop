/**
 * useAccordionStatus.tsx
 *
 * This custom hook to control the status (the color circle beside accordion title).
 * There are three status:
 * - initial: the color is orange, when the form is new without data filled yet and not touched.
 * - success: the color is green, when the form is prefilled from backend data,
 *  or when the form is filled without errors
 * - error: when there is an error
 */

import {
  FieldValues,
  FieldErrors,
  DeepMap,
  DeepPartial,
} from "react-hook-form";
import { ACCORDION_STATUS } from "../common/constants";

//type DirtyFieldsType = Partial<Readonly<FieldNamesMarkedBoolean<FieldValues>>>;
type TouchedFieldsType = Partial<
  Readonly<DeepMap<DeepPartial<FieldValues>, boolean>>
>;

interface SharedStatusParamsType<T extends FieldValues> {
  touchedFields: TouchedFieldsType;
  errors: FieldErrors<T>;
  // Field values are populated from backend and assumed is correct when onLoad is true
  isBackendData: boolean;
}

const useAccordionStatus = <T extends FieldValues>(
  { touchedFields, errors, isBackendData }: SharedStatusParamsType<T>,
  groups: Array<{ fields: string[] }>,
) => {
  return groups.map((group) => {
    let titleAccordionStatus = ACCORDION_STATUS.SUCCESS;
    // check initial
    if (!isBackendData) {
      titleAccordionStatus = ACCORDION_STATUS.INITIAL;
      let count = 0;
      for (const field in group.fields) {
        if (touchedFields[group.fields[field]]) {
          count++;
        }
      }
      if (count === group.fields.length) {
        titleAccordionStatus = ACCORDION_STATUS.SUCCESS;
      }
    }

    // check if there is any error with the passed fields
    for (const field in group.fields) {
      if (errors[group.fields[field]]) {
        titleAccordionStatus = ACCORDION_STATUS.ERROR;
      }
    }

    return titleAccordionStatus;
  });
};

export default useAccordionStatus;

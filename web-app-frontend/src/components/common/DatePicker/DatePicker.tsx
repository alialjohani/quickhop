import React, { useEffect } from "react";

import {
  UseFormSetValue,
  FieldValues,
  Path,
  PathValue,
  UseFormRegisterReturn,
} from "react-hook-form";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import ErrorMessage from "../Form/ErrorMessage";

interface FlatPickerOptionType {
  dateFormat: string;
  minDate: Date | undefined;
  allowInput: boolean;
  //defaultDate: string | undefined;
  utc: boolean;
  enableTime: boolean;
}

interface PropsType<T extends FieldValues> {
  field: Path<T>; // This ensures you provide the correct field name in the form schema
  label: string;
  initialDate?: string;
  errorMessage: string | undefined;
  setValue: UseFormSetValue<T>;
  registerObject: UseFormRegisterReturn;
  disabled?: boolean;
  isRestrictedForFutureDates?: boolean;
  isMandatory?: boolean;
  onChange?: () => void;
}

const DatePicker = <T extends FieldValues>({
  field,
  label,
  initialDate,
  errorMessage,
  setValue,
  disabled,
  isRestrictedForFutureDates = true,
  isMandatory = false,
  onChange,
}: PropsType<T>) => {
  useEffect(
    () =>
      // Set date as undefined at first
      setValue(field, initialDate as PathValue<T, Path<T>>),
    [field, initialDate],
  );
  const today = new Date(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  );
  // Convert to a Date object at midnight UTC
  //console.log(">>>>>> initialDate: ", initialDate?.split("T"));
  today.setDate(today.getDate());
  const flatPickerOptions: FlatPickerOptionType = {
    dateFormat: "Y-m-d", // Format of the date shown in the picker
    minDate: undefined,
    allowInput: false,
    //defaultDate: initialDate,
    utc: true,
    enableTime: false,
  };

  if (isRestrictedForFutureDates) {
    flatPickerOptions.minDate = initialDate ? undefined : today; // Minimum selectable date is today
  }

  return (
    <>
      <div className="mb-2">
        <div className="row">
          <label htmlFor="email" className="col-sm-6 col-form-label">
            {label} {isMandatory ? <span className="text-danger">*</span> : ""}
          </label>
          <div className="col-sm-12">
            <Flatpickr
              disabled={disabled}
              readOnly
              value={initialDate?.split("T")[0]}
              className={`form-control ${errorMessage ? "is-invalid" : ""} `}
              options={flatPickerOptions}
              onChange={(selectedDates) => {
                if (selectedDates.length > 0) {
                  const date = new Date(selectedDates[0]); // Convert timestamp to Date object
                  date.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
                  const formattedDate = date.toISOString(); // Convert to ISO string
                  // Use setValue to update the form value with the correct path and formatted date
                  setValue(field, formattedDate as PathValue<T, Path<T>>, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  if (onChange) {
                    onChange();
                  }
                }
              }}
            />
            {/* <input
                            type="hidden"
                            {...registerObject}
                        /> */}
            {errorMessage && <ErrorMessage message={errorMessage} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default DatePicker;

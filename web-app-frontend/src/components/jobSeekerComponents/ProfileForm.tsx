import React, { ChangeEvent, useEffect, useState } from "react";
import Input from "../common/Form/Input";
import Select from "../common/Form/Select";
import {
  getVALIDATION_STRING,
  VALIDATION_EMAIL,
  VALIDATION_PHONE,
  VALIDATION_SELECT,
} from "../../common/formsValidations";

import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import { JobSeekerCVFormType } from "../../common/types";
import DATA from "../../common/DATA_COUNTRIES_REGIONS.json";
import { FIELDS_CVForm } from "../../common/constants";

interface DependableSelectOptionType {
  [key: string]: { value: string; label: string }[];
}

const countryOptions = DATA.COUNTRIES;
const regionOptions: DependableSelectOptionType = DATA.REGIONS;

interface PropsType {
  initialValues: JobSeekerCVFormType;
  register: UseFormRegister<JobSeekerCVFormType>;
  errors: FieldErrors<JobSeekerCVFormType>;
  setValue: UseFormSetValue<JobSeekerCVFormType>;
  trigger: UseFormTrigger<JobSeekerCVFormType>;
  getValues: UseFormGetValues<JobSeekerCVFormType>;
}

const LINKEDIN_PATTERN =
  /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]{5,30}\/?$/;

const ProfileForm = ({
  initialValues,
  register,
  errors,
  setValue,
  trigger,
  getValues,
}: PropsType) => {
  // Make region select field depends on country select value
  const [selectedCountry, setSelectedCountry] = useState(initialValues.country);
  const [selectedRegion, setSelectedRegion] = useState(initialValues.region);

  const handleCountrySelection = (
    selectEvent: ChangeEvent<HTMLSelectElement>,
  ) => {
    trigger(FIELDS_CVForm.country);
    setSelectedCountry(selectEvent.target.value);
    setValue(FIELDS_CVForm.city, ""); // clear city when country is changed
  };

  const handleRegionSelection = (
    selectEvent: ChangeEvent<HTMLSelectElement>,
  ) => {
    trigger(FIELDS_CVForm.region);
    setSelectedRegion(selectEvent.target.value);
    setValue(FIELDS_CVForm.city, ""); // clear city when region is changed
  };

  useEffect(() => {
    const countryValue = getValues(FIELDS_CVForm.country);
    const regionValue = getValues(FIELDS_CVForm.region);
    if (countryValue) {
      setSelectedCountry(countryValue);
    }
    if (regionValue) {
      setSelectedRegion(regionValue);
    }
  }, [
    getValues,
    getValues(FIELDS_CVForm.country),
    getValues(FIELDS_CVForm.region),
  ]);

  return (
    <>
      <Input
        id="email"
        label="Email"
        type="text"
        errorMessage={errors[FIELDS_CVForm.email]?.message}
        registerObject={register(FIELDS_CVForm.email, VALIDATION_EMAIL)}
        disabled
      />
      <Input
        id="first_name"
        label="First Name"
        type="text"
        errorMessage={errors[FIELDS_CVForm.firstName]?.message}
        registerObject={register(
          FIELDS_CVForm.firstName,
          getVALIDATION_STRING("First name"),
        )}
      />
      <Input
        id="last_name"
        label="Last Name"
        type="text"
        errorMessage={errors[FIELDS_CVForm.lastName]?.message}
        registerObject={register(
          FIELDS_CVForm.lastName,
          getVALIDATION_STRING("Last name"),
        )}
      />
      <Input
        id="phone"
        label="Phone"
        type="text"
        errorMessage={errors[FIELDS_CVForm.phone]?.message}
        registerObject={register(FIELDS_CVForm.phone, VALIDATION_PHONE)}
      />
      <Input
        id="linkedin"
        label="Linkedin"
        type="text"
        errorMessage={errors[FIELDS_CVForm.linkedin]?.message}
        registerObject={register(FIELDS_CVForm.linkedin, {
          pattern: {
            value: LINKEDIN_PATTERN,
            message:
              "Please, enter a valid LinkedIn URL, starting with: https://www.linkedin.com/",
          },
        })}
      />
      <Select
        label="Country"
        id="country"
        errorMessage={errors[FIELDS_CVForm.country]?.message}
        registerObject={register(FIELDS_CVForm.country, {
          ...VALIDATION_SELECT,
          value: selectedCountry,
        })}
        options={countryOptions}
        onChange={handleCountrySelection}
        initialSelectedValue={selectedCountry}
      />
      <Select
        label="Region"
        id="region"
        errorMessage={errors[FIELDS_CVForm.region]?.message}
        registerObject={register(FIELDS_CVForm.region, {
          ...VALIDATION_SELECT,
          value: selectedRegion,
        })}
        options={regionOptions[selectedCountry]}
        disabled={selectedCountry === ""}
        onChange={handleRegionSelection}
        initialSelectedValue={selectedRegion}
      />
      <Input
        id="city"
        label="City"
        type="text"
        errorMessage={errors[FIELDS_CVForm.city]?.message}
        registerObject={register(
          FIELDS_CVForm.city,
          getVALIDATION_STRING("City"),
        )}
        // aiFeedbackMessage={AI_FEEDBACK}
      />
    </>
  );
};

export default ProfileForm;

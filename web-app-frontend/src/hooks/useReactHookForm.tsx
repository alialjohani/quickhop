import { FieldValues, useForm, DefaultValues, Resolver } from "react-hook-form";

type ModeType =
  | "onBlur"
  | "onChange"
  | "onSubmit"
  | "onTouched"
  | "all"
  | undefined;

const useReactHookForm = <T extends FieldValues>(
  //fields: Path<T>[],
  defaultValues: DefaultValues<T>,
  //validationOptions?: ValidationOptions[],
  mode: ModeType = "onTouched",
  // @typescript-eslint/no-explicit-any
  resolver?: Resolver<T, any>,
) => {
  // Ensure defaultValues is of type DefaultValues<T>
  const {
    register,
    handleSubmit,
    formState,
    getValues,
    setValue,
    setError,
    clearErrors,
    control,
    trigger,
    watch,
    reset,
  } = useForm<T>({
    defaultValues, // Pass default values here
    mode: mode,
    resolver: resolver,
    reValidateMode: "onChange",
  });

  const { errors, isValid, dirtyFields, touchedFields } = formState;

  // const fieldsRegister = [];
  // for (let i = 0; i < fields.length; i++) {
  //   const validationOption = validationOptions
  //     ? validationOptions[i]
  //     : undefined;

  //   // Register each field and store the return value in fieldsRegister
  //   fieldsRegister.push(register(fields[i], validationOption));
  //}

  return {
    register,
    handleSubmit,
    errors,
    //fieldsRegister,
    isValid,
    dirtyFields,
    touchedFields,
    getValues,
    setValue,
    setError,
    clearErrors,
    control,
    trigger,
    watch,
    reset,
  };
};

export default useReactHookForm;

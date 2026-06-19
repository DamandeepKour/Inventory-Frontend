import { useCallback, useState } from 'react';
import { hasErrors } from '../utils/validation';

export function useFormValidation(validateFn) {
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = useCallback(
    (values) => {
      const errors = validateFn(values);
      setFieldErrors(errors);
      return !hasErrors(errors);
    },
    [validateFn],
  );

  const clearErrors = useCallback(() => setFieldErrors({}), []);

  const touchField = useCallback(
    (values, field) => {
      const errors = validateFn(values);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (errors[field]) next[field] = errors[field];
        else delete next[field];
        return next;
      });
    },
    [validateFn],
  );

  const updateFieldErrors = useCallback((errors) => setFieldErrors(errors), []);

  return { fieldErrors, validate, clearErrors, touchField, setFieldErrors: updateFieldErrors };
}

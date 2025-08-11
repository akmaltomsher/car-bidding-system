import { ZodError } from 'zod';

type ZodValidationError = {
  path: (string | number)[];
  message: string;
};

export const formatZodError = (errors: ZodError['errors']): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  errors.forEach((err: ZodValidationError) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });

  return formattedErrors;
};

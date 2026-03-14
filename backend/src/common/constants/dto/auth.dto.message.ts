export const AUTH_DTO_MESSAGE = {
  EMAIL: {
    INVALID: 'Please provide a valid email address',
    REQUIRED: 'Email is required! Please provide email',
  },

  NAME: {
    REQUIRED: 'Name is required! Please provide name',
    MUST_BE_STRING: 'Name must be a string',
    MIN_LENGTH: (n: number) => `Name must be at least ${n} characters long`,
    MAX_LENGTH: (n: number) => `Name cannot be longer than ${n} characters`,
  },

  PASSWORD: {
    REQUIRED: 'Password is required! Please provide password',
    MIN_LENGTH: (n: number) => `Password must be at least ${n} characters long`,
  },
};

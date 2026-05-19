export const BRANCH_DTO_MESSAGE = {
  CODE: {
    REQUIRED: 'Branch code is required! Please provide branch code',
    STRING: 'Branch code must be a string',
    MIN: (n: number) => `Branch code must be at least ${n} characters long`,
    MAX: (n: number) => `Branch code cannot be longer than ${n} characters`,
  },

  NAME: {
    REQUIRED: 'Branch name is required! Please provide branch name',
    STRING: 'Branch name must be a string',
    MIN: (n: number) => `Branch name must be at least ${n} characters long`,
    MAX: (n: number) => `Branch name cannot be longer than ${n} characters`,
  },
};

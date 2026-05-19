export const SUBJECT_DTO_MESSAGE = {
  // Subject fields
  SEMESTER_ID: {
    REQUIRED: 'Semester is required! Please provide semesterId',
    INTEGER: 'Semester must be a valid integer',
  },

  BRANCH_ID: {
    REQUIRED: 'Branch is required! Please provide branchId',
    INTEGER: 'Branch must be a valid integer',
  },

  NAME: {
    REQUIRED: 'Subject name is required! Please provide name',
    STRING: 'Subject name must be a string',
    MIN: (n: number) => `Subject name must be at least ${n} characters long`,
    MAX: (n: number) => `Subject name cannot be longer than ${n} characters`,
  },

  CODE: {
    REQUIRED: 'Subject code is required! Please provide code',
    STRING: 'Subject code must be a string',
    MIN: (n: number) => `Subject code must be at least ${n} characters long`,
    MAX: (n: number) => `Subject code cannot be longer than ${n} characters`,
  },

  // Assign Subject fields
  ASSIGN_SUBJECT: {
    PROFESSOR_ID: {
      REQUIRED: 'Professor ID is required',
      INTEGER: 'Professor ID must be a valid integer',
    },
    SUBJECT_ID: {
      REQUIRED: 'Subject ID is required',
      INTEGER: 'Subject ID must be a valid integer',
    },
    SEMESTER_ID: {
      REQUIRED: 'Semester ID is required',
      INTEGER: 'Semester ID must be a valid integer',
    },
    ACADEMIC_YEAR_ID: {
      REQUIRED: 'Academic Year ID is required',
      INTEGER: 'Academic Year ID must be a valid integer',
    },
  },
};

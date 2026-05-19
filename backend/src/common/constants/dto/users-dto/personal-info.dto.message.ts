export const PI_DTO_MESSAGE = {
  FIRST_NAME: {
    REQUIRED: 'First name is required',
    STRING: 'First name must be a string',
  },
  ENROLLMENT_NUMBER: {
    REQUIRED: 'Enrollment number is required',
    STRING: 'Enrollment Number must be a string',
    LENGTH: (n: number) => `Enrollment Number Length must be ${n}`,
  },
  LAST_NAME: {
    REQUIRED: 'Last name is required',
    STRING: 'Last name must be a string',
  },
  GENDER_ID: {
    REQUIRED: 'Gender is required',
    NUMBER: 'Gender must be a valid enum id',
  },
  BRANCH_ID: {
    REQUIRED: 'Branch is required',
    NUMBER: 'Branch must be a valid enum id',
  },
  USER_ACCOUNT_STATUS_ID: {
    REQUIRED: 'User Account Status is required',
    NUMBER: 'User Account Status must be a valid enum id',
  },
  JOINED_ACADEMIC_YEAR_ID: {
    REQUIRED: 'Joined academic year is required',
    NUMBER: 'Joined academic year must be a valid enum id',
  },
  EXPECTED_GRADUATE_YEAR_ID: {
    REQUIRED: 'Expected graduate year is required',
    NUMBER: 'Expected graduate year must be a valid enum id',
  },
  PRIMARY_MOBILE_NUMBER: {
    REQUIRED: 'Primary mobile number is required',
    STRING: 'Primary mobile number must be a string',
    LENGTH: 'Primary mobile number must be 10 digits',
  },
  SECONDARY_MOBILE_NUMBER: {
    STRING: 'Secondary mobile number must be a string',
    LENGTH: 'Secondary mobile number must be 10 digits',
  },
  CITY: {
    REQUIRED: 'City is required',
    STRING: 'City must be a string',
  },
  STATE: {
    REQUIRED: 'State is required',
    STRING: 'State must be a string',
  },
  COUNTRY: {
    REQUIRED: 'Country is required',
    STRING: 'Country must be a string',
  },
  POSTAL_CODE: {
    REQUIRED: 'Postal code is required',
    STRING: 'Postal code must be a string',
    LENGTH: 'Postal code must be 6 digits',
  },
};

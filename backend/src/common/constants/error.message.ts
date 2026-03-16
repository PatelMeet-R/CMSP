export const ERRORMESSAGE = {
  EMAIL_ALREADY_EXISTS:
    'Email already in use! Please try with a Different email',
  USERNOTEXIST: 'Invalid credentials or account not exists',
  INVALID_TOKEN: 'Invalid token or Expired Token',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  INSUFFICIENT_PERMISSION: ' Insufficient permission',
  SMTP_CONNECTION_FAILED:
    'SMTP not configured! SMTP connection Failed due to Host',
  SERVER_ERROR: 'Internal Server Error',
  MAIL_SERVER_ISSUE:
    'mail server not working at time ! verify after few minutes',
  PASSWORD_NOT_MATCHES: 'Passwords do not match',
  ENUMTYPE_ALREADY_EXISTS:
    'Enum Type Already Exists! Change the Name Of Your Enum Type',
  BRANCH_ALREADY_EXISTS: 'Branch already Exists!',
  SEMESTER_INVALID_CREDENTIALS: 'Your Provided Semester Field Is Incorrect !',
  BRANCH_INVALID_CREDENTIALS: 'Your Provided Branch Field Is Incorrect !',
  SUBJECT_ALREADY_EXISTS:
    'Your Provided Subject Already Exist! Correct Your Subject Code Field ! ',
  SUBJECT_NOT_FOUND: 'Your Provided Subject Not Exist!',
  SUBJECT_CHANGE_NOT_AUTHORIZED:
    'You are not allowed to modify subjects of another branch',
  SUBJECT_ALREADY_ASSIGNED: 'Subject already assigned!',
  INVALID_REQUEST: 'Invalid data Provided! Checkout or Try Few minute later',
  EMAIL_VERIFY_NEEDED: 'Email is not verified. Access denied.',
  NOT_FOUND: 'Data Not Available!',
  INVALID_YEAR_ENTRY:
    'Expected graduation year cannot be earlier than joined year',
  DATA_NOT_FOUND: (data: string) => `${data} Not Found`,
};

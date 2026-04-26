// Success messages for user module
export const SUCCESS_MESSAGES = {
    USERS_RETRIEVED: 'Users retrieved successfully',
    USER_RETRIEVED: 'User retrieved successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    ACCOUNT_UPDATED: 'Account updated successfully',
    ACCOUNT_DELETED: 'Account deleted successfully',
    SIGNIN_SUCCESSFUL: 'Signin successful',
    PASSWORD_RESET_LINK_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
    VERIFICATION_EMAIL_RESENT: 'Verification email has been resent. Please check your email.',
    SIGNUP_SUCCESS: 'Signup successful. Please check your email to verify your account.',
    BUSINESS_OWNER_SIGNUP_SUCCESS: 'Signup successful. Please check your email to verify your account.',
    TOKEN_VALID: 'Token is valid',
    BUSINESSES_RETRIEVED: 'Businesses retrieved successfully',
    USER_STATUS_UPDATED: 'User status updated successfully',
    BUSINESS_STATS_RETRIEVED: 'Business stats retrieved successfully'
};

// Error messages for user module
export const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'No account found with this phone number. Please check your phone number and try again.',
    USER_ID_NOT_FOUND: (id: string) => `User with id ${id} not found`,
    USER_ALREADY_EXISTS: 'User with this phone number already exists',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid or expired token',
    VERIFICATION_TOKEN_REQUIRED: 'Verification token is required',
    EMAIL_SEND_FAILURE: 'Unable to send verification email',
    PASSWORD_RESET_EMAIL_FAILURE: 'Unable to send email',
    USER_NOT_AUTHORIZED_UPDATE: 'You are not authorized to update this user',
    USER_NOT_AUTHORIZED_DELETE: 'You are not authorized to delete this user',
    USER_NOT_AUTHORIZED_VIEW: 'You are not authorized to view this user',
    ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact support for assistance.',
    EMAIL_NOT_VERIFIED: 'Your email is not verified. Please check your email to verify your account.',
    SUBSCRIPTION_CANCELED: 'The subscription for this business owner has been canceled. Please contact your business owner.'
};

// Error codes and HTTP statuses from docs/api-spec.md section 3. One source for API and UI.
export const ERROR_CODES = {
  VALIDATION_FAILED: { status: 400, message: 'Some details are not valid.' },
  UNAUTHENTICATED: { status: 401, message: 'Please sign in to continue.' },
  FORBIDDEN: { status: 403, message: 'You do not have access to this.' },
  NOT_FOUND: { status: 404, message: 'We could not find that.' },
  CONFLICT: { status: 409, message: 'This request conflicts with an earlier one.' },
  BOOKING_OVERLAP: { status: 409, message: 'This vehicle is booked for those dates.' },
  QUOTE_EXPIRED: { status: 422, message: 'This quote has expired. Please request a new one.' },
  INVALID_STATUS_TRANSITION: {
    status: 422,
    message: 'That change is not allowed from the current status.',
  },
  DOCUMENTS_NOT_VERIFIED: { status: 422, message: 'Documents must be verified first.' },
  INSPECTION_REQUIRED: { status: 422, message: 'An inspection report is needed first.' },
  PAYMENT_FAILED: { status: 422, message: 'The payment was not completed.' },
  APPROVAL_REQUIRED: { status: 422, message: 'This amount needs approval first.' },
  RATE_LIMITED: { status: 429, message: 'Too many requests. Please try again shortly.' },
  INTERNAL_ERROR: { status: 500, message: 'Something went wrong on our side.' },
}

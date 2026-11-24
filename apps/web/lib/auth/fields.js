import { copy } from '@/copy/en'

// What each sign-in form asks for. The form component draws any of them; the server action checks the answers.
const text = copy.auth

const email = { name: 'email', label: text.signIn.email, type: 'email', autoComplete: 'email' }

export const signInFields = [
  email,
  {
    name: 'password',
    label: text.signIn.password,
    type: 'password',
    autoComplete: 'current-password',
  },
]

const passwordPair = [
  {
    name: 'password',
    label: text.signIn.password,
    type: 'password',
    autoComplete: 'new-password',
    helper: text.signUp.passwordHelper,
  },
  {
    name: 'confirm_password',
    label: text.signUp.confirmPassword,
    type: 'password',
    autoComplete: 'new-password',
  },
]

const companyName = {
  name: 'business_name',
  label: text.operatorSignUp.businessName,
  autoComplete: 'organization',
}

export const signUpFields = [
  { name: 'full_name', label: text.signUp.fullName, autoComplete: 'name' },
  email,
  ...passwordPair,
]

export const operatorSignUpFields = [
  companyName,
  { name: 'full_name', label: text.operatorSignUp.yourName, autoComplete: 'name' },
  { name: 'phone', label: text.operatorSignUp.phone, type: 'tel', autoComplete: 'tel' },
  email,
  ...passwordPair,
]

export const companyFields = [
  companyName,
  {
    name: 'phone',
    label: text.operatorCompany.phoneOptional,
    type: 'tel',
    autoComplete: 'tel',
    required: false,
  },
]

export const forgotFields = [email]

const settingsText = copy.settings

export const profileFields = [
  { name: 'full_name', label: settingsText.profile.fullName, autoComplete: 'name' },
  {
    name: 'phone',
    label: settingsText.profile.phone,
    type: 'tel',
    autoComplete: 'tel',
    required: false,
  },
]

export const changePasswordFields = [
  {
    name: 'current_password',
    label: settingsText.security.password.current,
    type: 'password',
    autoComplete: 'current-password',
  },
  {
    name: 'password',
    label: settingsText.security.password.next,
    type: 'password',
    autoComplete: 'new-password',
    helper: text.signUp.passwordHelper,
  },
  {
    name: 'confirm_password',
    label: settingsText.security.password.confirm,
    type: 'password',
    autoComplete: 'new-password',
  },
]

export const resetFields = [
  {
    name: 'password',
    label: text.reset.password,
    type: 'password',
    autoComplete: 'new-password',
    helper: text.signUp.passwordHelper,
  },
]

// A code is typed once and sent as soon as the sixth digit is in, so it is drawn large and spaced, and focused on arrival.
export const codeFields = [
  {
    name: 'code',
    label: text.code,
    inputMode: 'numeric',
    autoComplete: 'one-time-code',
    pattern: '[0-9 ]*',
    maxLength: 7,
    isCode: true,
  },
]

/** The errors of a failed check, as { field: message }, for showing under each field. */
export const fieldErrors = (zodError) =>
  Object.fromEntries(zodError.issues.map((issue) => [issue.path[0], issue.message]))

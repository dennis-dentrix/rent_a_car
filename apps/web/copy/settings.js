// Text for the Settings page: what a signed-in person can change about themselves and how they sign in.
export const settings = {
  meta: { title: 'Settings', description: 'Your profile, security, and how the site looks.' },
  title: 'Settings',
  subtitle: 'Your profile, how you sign in, and how the site looks on this device.',
  menu: 'Settings',
  profile: {
    title: 'Profile',
    hint: 'Your name and phone number are used on your bookings.',
    email: 'Email',
    emailHint: 'You sign in with this address. It cannot be changed here.',
    fullName: 'Full name',
    phone: 'Phone, with country code (optional)',
    save: 'Save changes',
    saved: 'Saved.',
  },
  notifications: {
    title: 'Notifications',
    marketing: 'Offers and news',
    marketingHint: 'Occasional emails about offers. Booking emails are always sent.',
    failed: 'That did not save. Try again.',
  },
  appearance: {
    title: 'Appearance',
    hint: 'Light, dark, or follow your device. Kept on this device.',
  },
  security: {
    title: 'Security',
    password: {
      title: 'Password',
      hint: 'Changing it signs you out of your other devices.',
      current: 'Current password',
      next: 'New password',
      confirm: 'Confirm new password',
      save: 'Change password',
      saved: 'Your password was changed. Other devices were signed out.',
      wrongCurrent: 'That is not your current password.',
    },
    twoStep: {
      title: 'Two-step sign-in',
      hint: 'After your password, enter a code from an authenticator app. A stolen password then is not enough to get in.',
      on: 'On',
      off: 'Off',
      required:
        'Required for your role. Staff and admin accounts always use the authenticator app.',
      turnOn: 'Turn on',
      turnOff: 'Turn off',
      cancel: 'Cancel',
      offHint: 'Enter a code from your authenticator app to turn it off.',
      offSubmit: 'Turn off two-step sign-in',
      offDone: 'Two-step sign-in is off.',
    },
    everywhere: {
      title: 'Sign out everywhere',
      hint: 'Ends every session of your account, on every device, including this one.',
      action: 'Sign out of all devices',
    },
  },
}

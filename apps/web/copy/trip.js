// The renter's trip page: their car, what to do before pickup, and the agreement.
export const trip = {
  route: {
    pickup_place: 'Pick up location',
    destination: 'Destination',
    asks: 'Asked of the company',
    wants_dropoff: 'Drop-off at the pick up location',
    wants_pickup: 'Pick-up when the hire ends',
  },
  call: (company) => `Call ${company}`,
  plate: (registration) => `Number plate ${registration}`,
  tasksTitle: 'Before pickup',
  waiting: (when) =>
    `Waiting for the company to answer. The request ends if they have not by ${when}.`,
  tasks: {
    national_id: 'National ID or passport',
    driving_licence: 'Driving licence',
    agreement: 'Rental agreement',
  },
  states: {
    todo: 'Needed',
    checking: 'Being checked',
    done: 'Done',
    rejected: 'Not accepted',
  },
  upload: 'Upload',
  replace: 'Upload again',
  uploading: 'Uploading',
  fileHelper: 'JPG, PNG, or PDF, up to 10 MB.',
  errors: {
    type: 'Choose a JPG, PNG, or PDF file.',
    size: 'That file is larger than 10 MB.',
    upload: 'The file did not upload. Try again.',
  },
  readAndSign: 'Read and sign',
  view: 'Read',
  agreement: {
    title: 'Rental agreement',
    back: 'Back to your booking',
    name: 'Your full name',
    accept: 'I have read this agreement and I accept it.',
    submit: 'Sign agreement',
    signing: 'Signing',
    signed: (name) => `Signed by ${name}.`,
    needTick: 'Tick the box to accept the agreement.',
    failed: 'The agreement could not be signed. Read it again and retry.',
  },
}

// Running a hire from the company's booking page.
export const hire = {
  request: {
    title: 'Booking request',
    hint: (when) => `Answer by ${when}, or the request expires.`,
    accept: 'Accept',
    decline: 'Decline',
    reason: 'If declining, why? The renter sees this.',
    reasonNeeded: 'Say why you are declining.',
  },
  next: {
    title: 'Next step',
    steps: {
      ready: 'Mark the car ready',
      active: 'Start the hire',
      returned: 'Car is back',
      closed: 'Close the booking',
    },
    needs: {
      ready: 'Needs the ID, licence and agreement checked.',
      active: 'Needs the pickup inspection report.',
      returned: 'Needs the return inspection report.',
      closed: 'Close it once everything is settled.',
    },
    done: 'Nothing left to do on this booking.',
    cancelTitle: 'Cancel this booking',
    cancelReason: 'Why? The renter sees this.',
    cancel: 'Cancel booking',
    reasonNeeded: 'Say why you are cancelling.',
  },
  documents: {
    title: 'Renter’s ID and licence',
    hint: 'Every time you open a file, who and why is recorded.',
    none: 'The renter has not uploaded them yet.',
    accept: 'Accept',
    reject: 'Reject',
    rejectReason: 'If rejecting, what should the renter fix?',
  },
  payment: {
    title: 'Payment at handover',
    paid: (paid, total) => `${paid} paid of ${total}`,
    amount: 'Amount received (KES)',
    reference: 'M-PESA or bank reference (optional)',
    methods: { cash: 'Cash', mpesa: 'M-PESA', bank: 'Bank' },
    method: 'How it was paid',
    record: 'Record payment',
    wrong: 'Enter an amount no larger than what is still owed.',
  },
}

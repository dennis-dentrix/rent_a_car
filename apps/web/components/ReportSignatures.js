import Panel from '@/components/Panel'
import ReportDownload from '@/components/ReportDownload'
import SignForm from '@/components/SignForm'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'

const text = copy.inspections

const SIDES = [
  { party: 'operator', label: text.report.companySide },
  { party: 'renter', label: text.report.renterSide },
]

function Signed({ label, signature }) {
  const how = signature?.method === 'account' ? text.report.inAccount : text.report.onDevice
  return (
    <div>
      <p className="text-footnote text-label-2">{label}</p>
      {signature ? (
        <>
          <p className="text-headline">
            {text.report.signedBy(signature.signed_name, momentText(signature.signed_at))}
          </p>
          <p className="text-footnote text-label-2">{how}</p>
        </>
      ) : (
        <p className="text-headline">{text.report.waiting}</p>
      )}
    </div>
  )
}

function Sealed({ report, side }) {
  return (
    <Panel
      title={text.report.sealedTitle}
      hint={text.report.sealedText(momentText(report.sealed.sealed_at))}
    >
      <div className="flex flex-col items-start gap-3">
        <ReportDownload side={side} id={report.id} />
        <p className="text-footnote text-label-2">{text.report.fingerprint}</p>
        <p className="num break-all text-footnote">{report.sealed.pdf_sha256}</p>
      </div>
    </Panel>
  )
}

// The forms offered to whoever is looking: the company signs for itself and can take the renter's signature on its
// screen; a renter signs only their own side.
function formsFor(side, signed) {
  const all =
    side === 'account'
      ? [
          {
            side: 'account',
            party: 'renter',
            title: text.sign.account,
            hint: text.sign.accountHint,
          },
        ]
      : [
          { side: 'company', party: 'operator', title: text.sign.company },
          {
            side: 'renterHere',
            party: 'renter',
            title: text.sign.renterHere,
            hint: text.sign.renterHereHint,
          },
        ]
  return all.filter((form) => !signed.includes(form.party))
}

/** Who has signed, the forms still open to this viewer, and the sealed copy once both have. `side` is 'console' or 'account'. */
export default function ReportSignatures({ report, side }) {
  const byParty = new Map(report.signatures.map((entry) => [entry.party, entry]))
  return (
    <>
      <Panel title={text.report.signatures}>
        <div className="grid gap-4 md:grid-cols-2">
          {SIDES.map(({ party, label }) => (
            <Signed key={party} label={label} signature={byParty.get(party)} />
          ))}
        </div>
      </Panel>
      {report.sealed && <Sealed report={report} side={side} />}
      <div className="grid items-start gap-5 md:grid-cols-2">
        {formsFor(side, [...byParty.keys()]).map((form) => (
          <Panel key={form.side} title={form.title} hint={form.hint}>
            <SignForm
              side={form.side}
              report={{ id: report.id, sha256: report.report_sha256 }}
              name={form.side === 'account' ? report.renter.full_name : ''}
            />
          </Panel>
        ))}
      </div>
    </>
  )
}

import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import SignaturePad from '@/components/SignaturePad'

/** What every online signature takes: the typed name, a drawing, any problem, and the button. */
export default function SignatureFields({ labels, name, onDraw, problem, isSigning }) {
  return (
    <>
      <TextField
        label={labels.name}
        name="signed_name"
        defaultValue={name}
        required
        minLength={2}
      />
      <SignaturePad onChange={onDraw} />
      {problem && <Alert tone="error" title={problem} />}
      <Button type="submit" isLoading={isSigning}>
        {isSigning ? labels.signing : labels.submit}
      </Button>
    </>
  )
}

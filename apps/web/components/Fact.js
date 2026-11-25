/** One labelled value in a description list. */
export default function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-footnote text-label-2">{label}</dt>
      <dd className="num text-headline">{value}</dd>
    </div>
  )
}

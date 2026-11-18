import { brand } from '@rent-a-car/shared/brand'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1200px] p-4">
      <h1 className="text-title1">{brand.name}</h1>
    </main>
  )
}

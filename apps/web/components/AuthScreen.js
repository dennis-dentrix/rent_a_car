import AuthForm from '@/components/AuthForm'
import LargeTitle from '@/components/LargeTitle'

/**
 * A sign-in or sign-up page: its heading, the form, and the links under it. `text` has a title and subtitle; `form`
 * is what AuthForm takes.
 */
export default function AuthScreen({ text, form, children }) {
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <div className="flex flex-col gap-4">
        <AuthForm {...form} />
        {children}
      </div>
    </>
  )
}

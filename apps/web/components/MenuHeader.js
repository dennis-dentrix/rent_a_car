import { X } from 'lucide-react'
import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.menu

function Person({ who }) {
  return (
    <div className="flex items-center gap-3">
      {/* A white ring and fill of its own, so the initials stand out on the navy. */}
      <span className="inline-flex shrink-0 rounded-pill bg-surface p-0.5">
        <Avatar name={who.name} src={who.avatar} size={52} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-title-2">{who.name}</p>
        {text.roles[who.role] && (
          <p className="text-footnote text-on-hero-2">{text.roles[who.role]}</p>
        )}
      </div>
    </div>
  )
}

function Visitor() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-title-2">{text.welcome}</p>
        <p className="text-callout text-on-hero-2">{text.welcomeText}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button href="/auth" variant="light" size="compact">
          {copy.nav.signIn}
        </Button>
        <Button href="/auth/sign-up" variant="glass" size="compact">
          {copy.auth.signIn.createAccount}
        </Button>
      </div>
    </div>
  )
}

/** The menu's navy head: the person with their picture, or the way to sign in. */
export default function MenuHeader({ who, onClose }) {
  return (
    <div className="pt-safe bg-hero px-4 pb-5 text-on-hero">
      <div className="flex justify-end py-2">
        <button
          type="button"
          aria-label={text.close}
          onClick={onClose}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-pill bg-hero-glass"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {who ? <Person who={who} /> : <Visitor />}
    </div>
  )
}

'use client'

import TextField from '@/components/Field'
import TextArea from '@/components/TextArea'
import { copy } from '@/copy/en'

const text = copy.editor.fields

/** The plain fields of a guide: what it is called, where it lives, what it answers, and how it opens. */
export default function PostFields({ draft, change, canChangeSlug }) {
  const set = (name) => (event) => change({ [name]: event.target.value })
  return (
    <div className="flex flex-col gap-4">
      <TextField label={text.title} value={draft.title} onChange={set('title')} maxLength={200} />
      <TextField
        label={text.slug}
        value={draft.slug}
        onChange={set('slug')}
        readOnly={!canChangeSlug}
        helper={canChangeSlug ? text.slugHelper(draft.slug) : text.slugFixed}
        autoCapitalize="none"
        spellCheck={false}
      />
      <TextField
        label={text.keyword}
        value={draft.keyword}
        onChange={set('keyword')}
        helper={text.keywordHelper}
        maxLength={100}
      />
      <TextArea
        label={text.description}
        value={draft.description}
        onChange={set('description')}
        rows={3}
        helper={text.descriptionCount(draft.description.trim().length)}
        maxLength={300}
      />
      <TextArea
        label={text.intro}
        value={draft.intro}
        onChange={set('intro')}
        rows={5}
        helper={text.introHelper}
        maxLength={2000}
      />
    </div>
  )
}

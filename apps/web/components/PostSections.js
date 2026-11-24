'use client'

import TextField from '@/components/Field'
import RowList from '@/components/RowList'
import Select from '@/components/Select'
import TextArea from '@/components/TextArea'
import { copy } from '@/copy/en'
import { blankLink, blankQuestion, blankSection } from '@/lib/post-editor'

const { sections: sectionText, faq: faqText, related: relatedText } = copy.editor

function SectionRow({ row, update, images }) {
  const options = [
    { value: '', label: sectionText.noImage },
    ...images.map((image) => ({ value: image.id, label: image.alt_text })),
  ]
  return (
    <>
      <TextField
        label={sectionText.heading}
        value={row.heading}
        onChange={(e) => update({ heading: e.target.value })}
        maxLength={200}
      />
      <TextArea
        label={sectionText.paragraphs}
        value={row.paragraphs}
        onChange={(e) => update({ paragraphs: e.target.value })}
        rows={8}
        helper={sectionText.paragraphsHelper}
      />
      <TextArea
        label={sectionText.items}
        value={row.items}
        onChange={(e) => update({ items: e.target.value })}
        rows={3}
        helper={sectionText.itemsHelper}
      />
      <Select
        label={sectionText.image}
        value={row.imageId}
        onChange={(e) => update({ imageId: e.target.value })}
        options={options}
      />
    </>
  )
}

function QuestionRow({ row, update }) {
  return (
    <>
      <TextField
        label={faqText.q}
        value={row.q}
        onChange={(e) => update({ q: e.target.value })}
        maxLength={200}
      />
      <TextArea
        label={faqText.a}
        value={row.a}
        onChange={(e) => update({ a: e.target.value })}
        rows={3}
        maxLength={1000}
      />
    </>
  )
}

function LinkRow({ row, update }) {
  return (
    <>
      <TextField
        label={relatedText.label}
        value={row.label}
        onChange={(e) => update({ label: e.target.value })}
        maxLength={80}
      />
      <TextField
        label={relatedText.href}
        value={row.href}
        onChange={(e) => update({ href: e.target.value })}
        helper={relatedText.hrefHelper}
        autoCapitalize="none"
        spellCheck={false}
      />
    </>
  )
}

/** The body of a guide: its sections, the questions it answers, and the pages it points readers to. */
export default function PostSections({ draft, change, images }) {
  return (
    <div className="flex flex-col gap-8">
      <RowList
        title={sectionText.title}
        noun={sectionText.noun}
        rows={draft.sections}
        onChange={(sections) => change({ sections })}
        makeRow={blankSection}
        addLabel={sectionText.add}
        renderRow={(row, update) => <SectionRow row={row} update={update} images={images} />}
      />
      <RowList
        title={faqText.title}
        noun={faqText.noun}
        rows={draft.faq}
        onChange={(faq) => change({ faq })}
        makeRow={blankQuestion}
        addLabel={faqText.add}
        renderRow={(row, update) => <QuestionRow row={row} update={update} />}
      />
      <RowList
        title={relatedText.title}
        noun={relatedText.noun}
        rows={draft.related}
        onChange={(related) => change({ related })}
        makeRow={blankLink}
        addLabel={relatedText.add}
        renderRow={(row, update) => <LinkRow row={row} update={update} />}
      />
    </div>
  )
}

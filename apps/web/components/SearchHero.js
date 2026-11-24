import Hero from '@/components/Hero'
import HeroSearch from '@/components/HeroSearch'

export const SEARCH_ID = 'search'

/** The navy hero with the search card overlapping its lower edge: the top of the home and every service page. */
export default function SearchHero({ hero, search, initialGroup, initialService }) {
  return (
    <div>
      <Hero {...hero} />
      <div id={SEARCH_ID} className="relative -mt-16 scroll-mt-24 px-2 md:-mt-20 md:px-10">
        <HeroSearch search={search} initialGroup={initialGroup} initialService={initialService} />
      </div>
    </div>
  )
}

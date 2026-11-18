# Growth and SEO Specification

**Purpose:** Defines how traffic will be acquired and how it is measured. Goals come from the PRD (local search growth and booking conversion). The technical SEO base is built in Phase 0 and Phase 1 of the roadmap. Honest expectations: search results take months and are not guaranteed.

## 1. Targets

| Measure                                      | Target                                                              | When reviewed |
| -------------------------------------------- | ------------------------------------------------------------------- | ------------- |
| Indexed public pages                         | All planned service, city, airport, office, and class pages indexed | Month 2       |
| Google Business Profile                      | Verified for each office and airport desk; reviews answered         | Launch        |
| Organic clicks to location and service pages | Baseline at day 90; growth target set then                          | Monthly       |
| Google reviews                               | Steady flow from requests after handover                            | Monthly       |
| Quote starts from organic visits             | Tracked by source                                                   | Monthly       |

## 2. Technical SEO (built before launch)

- Server-rendered or statically generated public pages with full HTML.
- Unique title, meta description, canonical URL, and Open Graph image on each page.
- Sitemap generated from the database; submitted to Google Search Console.
- `robots.txt` blocks account, staff, admin, and booking pages; those pages carry `noindex`.
- Clean URLs as listed in the IA document.
- Structured data (JSON-LD):
  - `Organization` on all pages.
  - `AutoRental` or `LocalBusiness` for each office.
  - `Product` or `Vehicle` for each class with price and availability.
  - `FAQPage` on FAQ blocks.
  - `BreadcrumbList` on all pages below the homepage.
- Core Web Vitals targets from the PRD.
- Images in WebP or AVIF with dimensions and descriptive alt text.
- `hreflang` added when the Swahili interface is built.

## 3. Local search

- Google Business Profile for each office and airport desk: exact name, address, hours, phone, categories (car rental, chauffeur service), photos.
- Name, address, and phone identical across the site, the profile, directories, and social media.
- Review requests sent after each handover by SMS, with a direct link. Every review answered within two working days.
- Listings on reputable Kenyan directories, with consistent details.
- No incentives for reviews; no fake reviews.

## 4. Page templates

| Template | Count at launch      | Built from                        | Required content                                                           |
| -------- | -------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Homepage | 1                    | Marketing content, live classes   | Sell first, search second; trust strip from real data only                 |
| Service  | 4                    | Service content                   | Problem, what is included, how booking works, pricing from, FAQ            |
| City     | Only served cities   | City data plus class availability | Local intro written for that city, classes offered, pickup options, FAQ    |
| Airport  | Only served airports | Location data                     | Transfer information, meet-and-greet fee, pickup steps, map                |
| Class    | One per class        | Rate table, vehicle data          | Specs, best for, included items, price, photos, reviews once threshold met |
| Office   | One per office       | Location data                     | Address, map, hours, entrance note                                         |
| FAQ      | 1                    | Owner-approved answers            | FAQ schema                                                                 |
| Article  | Monthly, planned     | Editorial plan                    | Answers one real question                                                  |

Rule: each page answers one intent and contains information the company can stand behind. Pages that only swap a place name are not created.

## 5. Keyword themes

These are starting themes. Confirm each against Search Console and a keyword tool before writing.

| Theme          | Example query                           | Page                            |
| -------------- | --------------------------------------- | ------------------------------- |
| Executive hire | executive car hire Nairobi              | Service and class pages         |
| Airport        | airport transfer JKIA                   | Airport page                    |
| Chauffeur      | chauffeur hire Nairobi                  | Service page                    |
| Monthly hire   | monthly car hire Kenya                  | Service page                    |
| Corporate      | corporate car hire Nairobi              | Corporate page                  |
| How to hire    | documents needed to hire a car in Kenya | Article                         |
| Events         | wedding car hire Nairobi                | Event page, once content exists |
| Cities         | car hire Mombasa                        | City page, only if served       |

City and destination names listed by the owner (for example Westlands, Karen, Kilimani, Upper Hill, Mombasa, Nakuru, Kisumu, Eldoret, Naivasha) are used only where the company serves them.

## 6. Content plan

- Launch set: homepage, four service pages, class pages, FAQ, office pages, and city and airport pages for served places.
- Month 1 to 3: one article per month on a real question (documents, pickup, pricing logic, airport arrivals), approved by the owner.
- Month 3 onward: refresh pages whose rates or FAQs changed; add pages only when there is real content.

## 7. Reviews and trust

- Reviews shown on the site only from verified bookings, with the source named.
- Review rating shown on class pages after five reviews for that class.
- No invented numbers, testimonials, or guarantees. The site reads figures from the database.
- Google reviews may be shown only within Google's terms of use, to be checked before launch.

## 8. Conversion growth

- Sticky booking bar on phones on class and quote pages.
- Progressive quote form.
- Abandoned-quote reminder (opt-in only) after 1 hour, one message.
- Return-customer reminder before a known rental date (opt-in only).
- Referral programme after launch, subject to legal and tax checks.

## 9. Paid and partner channels

- Paid search and social: not part of the launch plan; reviewed after 90 days of organic data.
- Partnerships with hotels, airports' ground-handling firms, and event planners: contact list owned by the sales lead; agreements in writing.
- Corporate outreach: owner-led; target segments from the PRD. No client is named without written permission.

## 10. Prohibited practices

- Paid links, link farms, or reciprocal link schemes.
- Hidden text, keyword stuffing, or cloaking.
- Copied content from competitors or directories.
- Fake or incentivised reviews.
- Doorway pages for places the company does not serve.

## 11. Reporting

| Report                                                         | Source                                  | Frequency | Owner     |
| -------------------------------------------------------------- | --------------------------------------- | --------- | --------- |
| Impressions, clicks, average position, top pages, crawl errors | Google Search Console                   | Monthly   | Developer |
| Calls, direction requests, website clicks per office           | Google Business Profile                 | Monthly   | Owner     |
| Organic visits to quote, booking, and paid steps               | PostHog (see the analytics document)    | Monthly   | Developer |
| Review count and rating                                        | Google, and the site's verified reviews | Monthly   | Owner     |

The monthly review is part of the success review in the roadmap.

## 12. Open questions

1. Which cities and airports the company serves (decides which pages exist).
2. Who writes or approves the monthly article.
3. Whether Google reviews may be displayed on the site, and how.

# Decision Log: Packages Added

Each package is added only when writing it ourselves would be long and risky (pack section 14). One entry per package, with the reason.

| Date | Package | Where | Why |
| --- | --- | --- | --- |
| 15 Nov 2026 | `pdf-lib` 1.17.1 | `apps/api` | Builds the rental agreement PDF. Pure JavaScript with no native parts, so the Docker image stays simple. Writing a PDF writer ourselves would be long and easy to get wrong. It uses the standard PDF fonts, so letters outside Western European languages print as the nearest plain letter or `?`; embedding a Unicode font (which needs a second package, `@pdf-lib/fontkit`, and a font file) is the fix if the owner needs full international names in the PDF. |
| 22 Nov 2026 | `wrangler` 4.166.0 | `apps/api` (dev dependency) | Builds, runs locally, and deploys the API to Cloudflare Workers. It is Cloudflare's own tool and the only supported way to deploy a Worker, so there is nothing to write ourselves. It is a build tool and is not part of the running API. |

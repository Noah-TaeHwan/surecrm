# SureCRM Portfolio Verification — 2026-07-30

This note records the evidence used by the SureCRM portfolio case study. It
separates repository inspection, practitioner testing, historical deployment,
and operational validation.

## Scope

- Repository: `Noah-TaeHwan/surecrm`
- Case-study branch: `docs/surecrm-hero-readme`
- Reviewed portfolio commit: `65c4d3f3eb13af514cf29a304098fd9106bcf5ea`
- Review date: 2026-07-30 KST
- Review mode: source inspection and public-surface inspection only

The review did not use published test credentials, enter authenticated product
flows, call provider-backed routes, inspect tenant data, or test production
security.

## Evidence matrix

| Statement                                                                     | Evidence                                                                | Boundary                                                                          |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| The project began from one insurance agent's workflow needs                   | Noah's direct account and the historical Nomad Coders project post      | Practitioner-informed origin; not market validation                               |
| Noah was the sole human product owner, designer, and builder                  | Noah's direct account                                                   | AI contributed extensively; this is not a claim that every line was hand-written  |
| One practitioner logged in, tested the product, and gave qualitative feedback | Noah's direct account                                                   | Test n=1; no approved quote or quantitative result                                |
| The project did not reach sustained operational use                           | Noah's direct account                                                   | No adoption, retention, or repeat-demand claim                                    |
| Referral relationships are represented in the client model                    | `app/lib/schema/core.ts` and `app/features/network/lib/network-data.ts` | Source-inspected; live tenant behavior not tested                                 |
| Pipeline and dashboard flows exist in the repository                          | Pipeline routes, feature modules, and dashboard data modules            | Source-inspected; browser behavior not tested                                     |
| A public deployment existed                                                   | Historical deployment and public reachability checks                    | Reachability did not verify authenticated behavior, uptime, security, or adoption |
| The three portfolio previews contain fictional data                           | `docs/assets/portfolio/*.svg` inspection                                | Synthetic illustration; not a runtime screenshot or customer record               |

## Quality snapshot

The 2026-07-29 local review recorded:

- targeted README formatting passed;
- three SVG files passed XML, local render, accessibility-metadata, and
  active-content checks;
- a provider-isolated build exited successfully;
- an artifact secret scan reported zero findings;
- `git diff --check` passed for the reviewed portfolio changes.

The provider-isolated build used additional local configuration changes that
were not part of PR #3 at commit
`65c4d3f3eb13af514cf29a304098fd9106bcf5ea`. It does not prove that PR #3
alone provides those isolation gates.

The same review also recorded pre-existing repository debt:

- formatting: 41 files;
- lint: 249 errors and 2,816 warnings;
- typecheck: 54 errors;
- tests: 139 passed and 4 failed.

These dated counts describe that checkout. They are not current guarantees and
must be rerun before making a newer quality claim.

## Public-surface boundary

The repository README does not promote the historical deployment. Before any
deployment is linked again, its public landing, FAQ, pricing, testimonial,
privacy, terms, and test/provider routes require a separate review. Published
historical credentials must be revoked or replaced through an authorized
administrator surface.

## Interpretation

SureCRM demonstrates that Noah translated one practitioner's workflow into a
deployed software prototype and made product, data-model, and implementation
decisions. It does not demonstrate production readiness, secure multitenancy,
privacy-law compliance, operational reliability, customer adoption, or
sustained business use.

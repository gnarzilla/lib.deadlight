# lib.deadlight

Shared JS/C modules for the Deadlight ecosystem.

`lib.deadlight` is the common code layer used by Deadlight projects to avoid duplicating infrastructure across repos. It is currently required by [`blog.deadlight`](https://github.com/gnarzilla/blog.deadlight) and contains modules extracted from that project as they become reusable.

This repository is public because Deadlight projects are public and depend on it. It is not yet a polished general-purpose framework; it is a practical shared library under active cleanup.

## Status

Active extraction and stabilization.

The JavaScript modules are the most mature today and are primarily shaped by `blog.deadlight`. The native C modules are earlier-stage, but they reflect real reuse goals across `deadlight-proxy`, `deadmesh`, and the planned `vault.deadlight`.

APIs may change while the library stabilizes.

## What Lives Here

```text
lib.deadlight/
├── core/       # JavaScript modules used by Workers/blog apps
├── c/          # Native C modules and shared C experiments
├── shared/     # Shared ecosystem config/schema experiments
├── reference/  # Scratch notes and non-API reference material
└── README.md
```

## JavaScript Core

Located under `core/src/`.

These modules currently support `blog.deadlight` and other Workers/D1-style Deadlight apps.

Current areas:

* `auth/` — JWT helpers, password hashing, auth errors
* `components/` — reusable HTML/UI components for admin, auth, posts, and users
* `db/` — D1 model helpers, migrations, and base model patterns
* `logging/` — shared logger utilities
* `markdown/` — markdown rendering and excerpt processing
* `security/` — headers, middleware, rate limiting, and validation helpers
* `utils/` — moderation, subdomain, template, and general utility helpers

Dependencies include:

* `marked` for markdown parsing
* `xss` and `cssfilter` for sanitization
* `commander` for CLI/helper tooling

## Native C Modules

Located under `c/`.

These modules are earlier-stage, but they point toward shared native infrastructure across the ecosystem.

Current areas:

* `auth/` — auth-related headers/stubs for future native credential work
* `network/` — shared networking primitives, currently including `connection_pool.c`

The connection pool module was extracted because `deadmesh` began as a fork of `deadlight-proxy`, and the two projects share native networking code. `lib.deadlight` is the intended home for modules that should not remain duplicated across both projects.

The C modules are not yet a stable public C API.

## Deadlight Context

Deadlight is an ecosystem for publishing, proxying, and routing across unpredictable networks.

The stack has three broad layers:

* **Transport:** `deadlight-proxy` and `deadmesh`
* **Security:** `vault.deadlight`
* **Application:** `blog.deadlight`

`lib.deadlight` sits underneath those projects as the shared module layer. Code is moved here when reuse becomes real, not just theoretical.

## Installation

```bash
git clone https://github.com/gnarzilla/lib.deadlight.git
cd lib.deadlight
npm install
```

For local development with `blog.deadlight`:

```bash
cd lib.deadlight
npm link

cd ../blog.deadlight
npm link @deadlight/core
```

Package names and exports are still stabilizing.

## Development Notes

Some files in `reference/` are scratch material, design notes, or context used during development. They are not part of the public API.

If a module is under `core/src/`, it is part of the JavaScript library surface or moving toward that role.

If a module is under `c/`, treat it as native shared infrastructure under active development unless documented otherwise.

## Roadmap

### Near Term

* [ ] Audit actual exports and update examples accordingly
* [ ] Document which modules are currently consumed by `blog.deadlight`
* [ ] Remove or relocate stale scratch files
* [ ] Add tests for markdown processing
* [ ] Add tests for auth/password helpers
* [ ] Clarify package names and import paths

### Native Shared Code

* [ ] Decide which `deadlight-proxy` / `deadmesh` modules belong in `lib.deadlight`
* [ ] Stabilize `c/network/connection_pool`
* [ ] Expand native auth primitives only where needed by `vault.deadlight`
* [ ] Define the JS/C boundary for local credential workflows

### Ecosystem Reuse

* [ ] Standardize D1 model conventions across Workers projects
* [ ] Document security middleware usage
* [ ] Share common admin/auth components across Deadlight web apps
* [ ] Keep `lib.deadlight` small enough to remain useful outside a monolith

## License

MIT License. See [LICENSE](LICENSE).

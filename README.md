# lib.deadlight

Shared modules for the Deadlight ecosystem.

`lib.deadlight` is the common library layer behind Deadlight projects: markdown rendering, authentication helpers, database utilities, UI components, and other small modules that are useful across edge-native apps.

The library currently exists mostly as code extracted from [`blog.deadlight`](https://github.com/gnarzilla/blog.deadlight), where the modules are actively used and hardened. Over time, it will become the shared foundation for `blog.deadlight`, `deadlight-proxy` integrations, and the upcoming `vault.deadlight` credential layer.

## Status

This project is under active extraction and cleanup.

Most modules began inside `blog.deadlight` and are being moved here as they become reusable. APIs may change while the ecosystem stabilizes.

Current practical use:

* Shared markdown rendering and excerpt handling for `blog.deadlight`
* Authentication and session helpers used by Deadlight web/admin tools
* Database model patterns for Cloudflare Workers + D1
* Reusable post/list/pagination components
* Early auth/security stubs intended to support `vault.deadlight`

## Deadlight Context

Deadlight is an ecosystem for publishing, proxying, and routing across unpredictable networks.

The stack has three broad layers:

* **Transport:** `deadlight-proxy` and `deadmesh`
* **Security:** `vault.deadlight`
* **Application:** `blog.deadlight`

`lib.deadlight` sits underneath those projects as the shared code layer. It is not meant to be a large framework; it is a small collection of practical modules that keep Deadlight projects consistent without forcing them into one monolith.

## Modules

### Markdown

Markdown rendering and content helpers used by `blog.deadlight`.

Planned/active responsibilities:

* Markdown-to-HTML rendering
* Excerpt extraction
* Manual excerpt markers such as `<!--more-->`
* Sanitization hooks
* Small-footprint publishing utilities

### Authentication

Authentication helpers for Deadlight admin surfaces and future local-first tools.

Current/planned responsibilities:

* Password hashing helpers
* Session/JWT utilities
* Role checks for admin routes
* Shared auth patterns for Workers-based apps
* Early C stubs for future `vault.deadlight` integration

### Database

Database helpers and model patterns for Cloudflare D1-backed apps.

Current/planned responsibilities:

* Base model helpers
* D1 query utilities
* Common models for users, posts, and settings
* Migration conventions

### Components

Small HTML rendering components used by Deadlight web projects.

Current/planned responsibilities:

* Post lists
* Pagination
* Content containers
* Minimal theme-aware markup

### Logging and Utilities

Shared helpers for structured logging, request context, formatting, and other cross-project utilities.

## Installation

```bash
git clone https://github.com/gnarzilla/lib.deadlight.git
cd lib.deadlight
npm install
```

For local development with another Deadlight project:

```bash
cd lib.deadlight
npm link

cd ../blog.deadlight
npm link @deadlight/core
```

Package names and exports are still stabilizing.

## Example Usage

### Markdown

```javascript
import { MarkdownProcessor } from '@deadlight/core/markdown';

const processor = new MarkdownProcessor();

const html = await processor.render('# Hello Deadlight');

const excerpt = processor.extractExcerpt(markdown, 200);
```

### Database Models

```javascript
import { PostModel } from '@deadlight/core/db/models';

const posts = new PostModel(env.DB);

const result = await posts.getPaginated({
  page: 1,
  limit: 10,
  includeAuthor: true
});
```

### Authentication

```javascript
import { createJWT, verifyJWT } from '@deadlight/core/auth';

const token = await createJWT(
  { id: user.id, username: user.username },
  env.JWT_SECRET
);

const payload = await verifyJWT(token, env.JWT_SECRET);
```

## Repository Layout

```text
lib.deadlight/
└── core/
    └── src/
        ├── auth/        # Authentication/session helpers
        ├── db/          # D1 models and database utilities
        ├── logging/     # Shared logging helpers
        ├── markdown/    # Markdown rendering and excerpts
        ├── components/  # Small reusable HTML components
        └── utils/       # Shared utility functions
```

## Roadmap

### Near Term

* [ ] Audit exports and remove stale APIs
* [ ] Sync README examples with actual package paths
* [ ] Document modules currently used by `blog.deadlight`
* [ ] Add tests around markdown and auth helpers
* [ ] Separate stable exports from experimental modules

### Vault Integration

* [ ] Identify auth/session modules that should move toward `vault.deadlight`
* [ ] Expand C stubs where local credential storage requires native support
* [ ] Define a clean JS/C boundary for offline-friendly credential workflows
* [ ] Support local-first secrets without requiring network access

### Ecosystem Reuse

* [ ] Make shared components usable by multiple Deadlight web apps
* [ ] Standardize D1 model conventions across Workers projects
* [ ] Add common security headers and input validation helpers
* [ ] Document integration patterns for `blog.deadlight` and future apps

## Development

Requirements:

* Node.js 18+
* npm
* Wrangler CLI for Workers/D1 consumers

```bash
npm install
npm test
```

## License

MIT License. See [LICENSE](LICENSE).

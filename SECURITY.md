# Security policy

## Public content boundary

This repository is intentionally restricted to metadata required to discover and install remotely hosted MCP servers.

Allowed content:

- `plugin.json` and `mcp.json` manifests
- Public SVG icons and logos
- Public marketplace metadata
- English installation and security documentation
- Dependency-free validation and packaging automation
- CI configuration for validating this public repository

Prohibited content:

- MCP server or Cloudflare Worker implementation
- Website source code or private content corpora
- Environment files, API keys, bearer tokens, access codes or challenge values
- Fixed authorization headers
- Local `stdio` server commands, lifecycle hooks or executable app references
- Private repository URLs or reviewer-only information

## Remote-only guarantee

All server declarations must use `streamable-http`, an approved `https:` URL and the `/mcp` path. The validator is allowlist-based: it accepts only the listed repository files, the `type`, `url` and `extensions` server fields, and `auth.type: none`. Anything else, including local commands, arguments, headers, environment blocks, lifecycle hooks and unexpected files, fails validation. Every file is also checked for credential-like material such as private keys and provider tokens.

The validator deliberately contains no list of private names. Private identifiers are checked by the operator before content is proposed here, so this repository never needs to reference them.

## Reporting

Report suspected secret exposure or an unsafe manifest privately to `support@ptl.expert`. Do not open a public issue containing a credential or private source code.

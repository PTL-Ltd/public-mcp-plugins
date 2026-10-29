# PTL Public MCP Plugins

Public, metadata-only client packages for three read-only remote MCP servers operated by Providing Technical Leadership Kft.

## Remote servers

| Package | Endpoint | Purpose |
| --- | --- | --- |
| `gabor-knowledge` | `https://mcp.gaborharsanyi.me/mcp` | Published professional evidence |
| `ptl-knowledge` | `https://mcp.ptl.expert/mcp` | Published PTL service evidence |
| `ai-tpm-knowledge` | `https://mcp.aitpm.work/mcp` | Published technology articles |
| `perplexity-suite` | All three endpoints | Combined Perplexity package |

## Security boundary

These are remote-only MCP integrations. Every `mcp.json` uses `streamable-http` with a public HTTPS URL. This repository contains no server or website source code, content data, credentials or secrets, fixed authorization headers, `stdio` commands, executable lifecycle hooks or local server launch configuration.

Installing a package makes the AI client call the hosted endpoint. It does not install or execute the server locally.

## Install

### Perplexity

Import this public folder:

```text
https://github.com/PTL-Ltd/public-mcp-plugins/tree/main/perplexity-suite
```

Alternatively, add each endpoint as a remote custom MCP connector with no authentication and Streamable HTTP transport.

### Codex marketplace

```bash
codex plugin marketplace add PTL-Ltd/public-mcp-plugins --ref main
codex plugin marketplace list
```

### ChatGPT and OpenAI

Each single-server package can be tested as a custom remote MCP server. For public review, build the ZIP files and upload the three single-server archives separately.

```bash
npm run validate
npm run build
```

Generated archives are written to `dist/` and are not committed.

## Repository contents

Only public metadata, SVG brand assets, validation/build automation and documentation belong here.

See [SECURITY.md](SECURITY.md) before proposing changes.

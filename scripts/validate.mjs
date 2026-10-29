import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageNames = [
  "perplexity-suite",
  "gabor-knowledge",
  "ptl-knowledge",
  "ai-tpm-knowledge",
];
const expectedEndpoints = new Set([
  "https://mcp.gaborharsanyi.me/mcp",
  "https://mcp.ptl.expert/mcp",
  "https://mcp.aitpm.work/mcp",
]);
const allowedServerKeys = new Set(["type", "url", "extensions"]);
const credentialPatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
];
const allowedRepositoryFiles = new RegExp(
  "^(" +
    [
      "\\.agents/plugins/marketplace\\.json",
      "\\.github/workflows/validate\\.yml",
      "\\.gitignore",
      "README\\.md",
      "SECURITY\\.md",
      "LICENSE",
      "package\\.json",
      "scripts/(validate|build)\\.mjs",
      "perplexity-suite/(plugin|mcp)\\.json",
      "(gabor|ptl|ai-tpm)-knowledge/(plugin\\.json|mcp\\.json|assets/(icon|logo)\\.svg)",
    ].join("|") +
    ")$",
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const name of packageNames) {
  const directory = path.join(root, name);
  assert.ok(fs.existsSync(directory), `${name} is missing`);
  const allowedFiles = name === "perplexity-suite"
    ? new Set(["plugin.json", "mcp.json"])
    : new Set(["plugin.json", "mcp.json", "assets/icon.svg", "assets/logo.svg"]);
  const files = walk(directory).map((file) => path.relative(directory, file).replaceAll("\\", "/"));
  assert.deepEqual(new Set(files), allowedFiles, `${name} contains unexpected files`);

  const plugin = readJson(path.join(directory, "plugin.json"));
  const mcp = readJson(path.join(directory, "mcp.json"));
  assert.equal(plugin.repository, "https://github.com/PTL-Ltd/public-mcp-plugins");
  assert.equal(plugin.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  assert.equal(mcp.$schema, "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json");

  const servers = Object.values(mcp.mcpServers || {});
  assert.ok(servers.length >= 1 && servers.length <= 15, `${name} has an invalid server count`);
  if (name !== "perplexity-suite") assert.equal(servers.length, 1, `${name} must contain one server`);
  for (const server of servers) {
    assert.equal(server.type, "streamable-http", `${name} is not remote Streamable HTTP`);
    const endpoint = new URL(server.url);
    assert.equal(endpoint.protocol, "https:");
    assert.equal(endpoint.pathname, "/mcp");
    assert.ok(expectedEndpoints.has(endpoint.href), `${name} uses an unexpected endpoint`);
    for (const key of Object.keys(server)) {
      assert.ok(allowedServerKeys.has(key), `${name} declares unsupported server field ${key}`);
    }
    const extensionKeys = Object.keys(server.extensions || {});
    assert.ok(extensionKeys.every((key) => key === "com.openai"), `${name} has an unexpected extension`);
    const openaiServer = server.extensions?.["com.openai"];
    if (openaiServer) {
      assert.deepEqual(Object.keys(openaiServer), ["auth"], `${name} has unexpected OpenAI server fields`);
      assert.deepEqual(openaiServer.auth, { type: "none" }, `${name} must not require authentication`);
    }
  }

  assert.equal(plugin.hooks, undefined, `${name} declares lifecycle hooks`);
}

const suite = readJson(path.join(root, "perplexity-suite", "mcp.json"));
assert.deepEqual(new Set(Object.values(suite.mcpServers).map((server) => server.url)), expectedEndpoints);

const marketplace = readJson(path.join(root, ".agents", "plugins", "marketplace.json"));
assert.deepEqual(
  marketplace.plugins.map((plugin) => plugin.name).sort(),
  packageNames.filter((name) => name !== "perplexity-suite").sort(),
);
for (const entry of marketplace.plugins) {
  assert.equal(entry.source.url, "https://github.com/PTL-Ltd/public-mcp-plugins.git");
  assert.equal(entry.source.ref, "main");
  assert.equal(entry.source.path, `./${entry.name}`);
}

const repositoryFiles = walk(root)
  .map((file) => path.relative(root, file).replaceAll("\\", "/"))
  .filter((file) => !/^(\.git|node_modules|dist)\//.test(file));
for (const file of repositoryFiles) {
  assert.match(file, allowedRepositoryFiles, `Unexpected repository file: ${file}`);
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const pattern of credentialPatterns) {
    assert.doesNotMatch(text, pattern, `${file} contains credential-like material`);
  }
}

console.log("Validated four metadata-only, remote MCP packages.");

# RealityMirror

**Me arguing with Reality v0.1** - an interactive comic + visual forge built for GitHub Pages.

## Structure (ISA-95 Factory Hierarchy)

```
/ (Enterprise)
├── index.html              # Auto-loader: discovers tools, renders iframe grid
├── tools/                  # Site level
│   ├── manifest.json       # Tool registry (auto-discovery)
│   ├── reality-comic/      # Area: WebLLM-powered comic chat
│   │   └── index.html      # Argue with your stoner surfer devil "Reality"
│   └── infinity-forge/     # Area: Three.js geometry forge
│       └── index.html      # Trinary infinity mirror visualization
```

## Tools

- **Reality vs Me** - Local LLM inference via WebLLM/WebGPU. Chat with "Reality", the stoner surfer devil who lives in your head and convinces you to procrastinate using agile terminology. Falls back to canned responses if WebGPU unavailable.
- **Infinity Forge** - Three.js geometry forge with infinity mirrors, golden ratio physics, and trinary timeline agents.

## Usage

Serve via GitHub Pages or any static server. Root `index.html` auto-loads all tools from `manifest.json` into an iframe grid. Add new tools by creating a subdir under `tools/` and registering in the manifest.

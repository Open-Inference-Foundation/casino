# Ca$ino

**Describe an app. Get a live URL. The AI builds it, hosts it, and gives it an agent.**

Every app built on Casino is a node in the [Open Inference Foundation](https://openinferencefoundation.org) agent network. The agent powers the app. Users interact with the agent. Builders earn from every interaction. The network grows from the edges.

[Try it](https://casino.flowstack.fun) | [Foundation](https://openinferencefoundation.org) | [Docs](https://openinferencefoundation.org/thesis)

---

## What Casino Does

You type a sentence. Casino builds a full-stack web app in under 10 minutes.

```
"Build me a customer support chatbot for my Shopify store"
```

What you get:
- **React + TypeScript app** on a live CDN URL
- **AI agent** that answers questions, queries data, takes actions
- **MongoDB database** with per-user data isolation
- **Authentication** (Google, Apple, GitHub, Twitter, email, wallet)
- **Admin panel** for managing content
- **Mobile responsive** out of the box

No code. No deploy scripts. No infrastructure setup. Describe it, watch the agents build it, share the link.

---

## How It Works

A swarm of specialized AI agents collaborates to build your app:

```
You describe an app
  → Strategic Planner analyzes requirements
    → Site Planner designs the architecture
      → Schema Designer models the data
        → Style Agent creates the design system
          → JS Builder generates React components
            → Compiled, published, live
```

Each agent is a specialist. The planner thinks about strategy. The schema designer thinks about data. The style agent thinks about design. The JS builder writes production code. They hand off to each other like a team.

The result isn't a mockup. It's a running app with a real database, real auth, and a real AI agent that your users can talk to.

---

## The Agent Network

Every app built on Casino is a **node** in the Open Inference Foundation's agent network.

```
Casino (builder)
  ↓
[Your App] ← you earn 60% of every query
  ↓
[User's App] ← they build on top of yours, you earn referral revenue
  ↓
[Their User's App] ← the network grows from the edges
```

- **Builders earn 60%** of every AGENT token spent on queries to their app
- **The Foundation earns 30%** to fund wholesale LLM rates
- **Flowstack earns 10%** for infrastructure

The more people use your app, the more you earn. The more apps in the network, the cheaper inference gets for everyone — because the co-op negotiates wholesale rates based on aggregate volume.

---

## Economics

Casino uses the Open Inference Foundation's two-token model:

| Token | What It Does |
|-------|-------------|
| **INFER** | Stake for membership. Earn discounts. Govern the co-op. Fixed 1B supply. |
| **AGENT** | Pay per query. Builders earn it. Soft-pegged to ~$0.01/compute unit. |

Users pay with credit card (Stripe) or AGENT tokens. Staking INFER unlocks discounts:

| Tier | Stake | Discount |
|------|-------|----------|
| Base | 0 | 0% |
| Member | 1,000 INFER | 15% |
| Pro | 10,000 INFER | 30% |
| Founder | 100,000 INFER | 50% |

Contracts live on Arbitrum mainnet. Settlement is on-chain via [`AgentPaymentV3`](https://arbiscan.io/address/0xcB6d809b518316c5E7af46CE19dc92B0e2cB352D).

---

## Quick Start

```bash
git clone https://github.com/open-inference-foundation/casino.git
cd casino
cp .env.example .env.local
npm install
npm run dev
```

Launches at `http://localhost:3000` in mock mode. No backend needed — mock mode simulates the full agent experience.

For production mode, you need a [Flowstack API](https://flowstack.fun) backend. See [Configuration](#configuration).

---

## Architecture

```
Casino (this repo)       @flowstack/sdk           Sage
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Vite + React 19  │───>│ useAgent()       │───>│ Agent Swarm      │
│ Tailwind CSS 4   │    │ useCollection()  │    │ Orchestrator     │
│ React Router     │    │ useAuth()        │    │ Build Pipeline   │
│ Privy (wallets)  │    │ WalletProvider   │    │ Settlement       │
└──────────────────┘    └──────────────────┘    └──────────────────┘
  Frontend (open)        SDK (open)              Backend (private)
```

**Frontend** — Vite, React 19, TypeScript, Tailwind CSS 4. This repo.

**SDK** — `@flowstack/sdk` provides the hooks that make everything work:
- `useAgent()` — chat with the AI agent
- `useCollection()` — read/write MongoDB with per-user isolation
- `useAuth()` — email, Google, Apple, GitHub, Twitter, LinkedIn, Spotify, wallet
- `WalletProvider` — Privy embedded wallets + WalletConnect

**Backend** — Sage (Python/FastAPI). The agent swarm, build pipeline, orchestrator, and settlement service. Private repo — the SDK is the public interface.

---

## What Gets Built

Every app Casino generates includes:

| Feature | How |
|---------|-----|
| **Live URL** | Compiled React app on CloudFront CDN |
| **AI Agent** | Configurable target agents from the foundation swarm |
| **Database** | MongoDB with `useCollection` hooks, per-user data isolation |
| **Auth** | Privy-powered: Google, Apple, GitHub, Twitter, email, wallet |
| **Admin** | Password-gated admin routes (when the app needs them) |
| **SEO** | Pre-rendered HTML, meta tags, sitemap, structured data |
| **Mobile** | Responsive from the start — mobile-first layout |
| **Security** | Built-in security scanning via `@secure-ai-app/cli` |

Apps are generated as standard React + Vite projects. You can export to GitHub, edit locally, push back to Casino for verified rebuild.

---

## Project Structure

```
src/           Vite entry, router, pages
components/    Workspace, auth, chat, landing UI
lib/           Config, constants, utilities
packages/
  flowstack-sdk/   SDK source (vendored for development)
public/        Static assets, SEO files
scripts/       Build-time generators (favicon, sitemap)
```

---

## Configuration

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FLOWSTACK_MODE` | Yes | `mock` (local dev) or `production` (API) |
| `VITE_FLOWSTACK_BASE_URL` | Production | Flowstack API endpoint |
| `VITE_FLOWSTACK_TENANT_ID` | Production | Your tenant ID |
| `VITE_PRIVY_APP_ID` | Optional | Privy app ID for wallet + social auth |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe key for credit purchases |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |

**Mock mode** is the default. It simulates the full backend — agent chat, workspace data, build progression, credential management. No API keys needed.

---

## Built Apps Are Network Nodes

When you build an app on Casino, you're not just generating code. You're creating a **node in a cooperative AI network**:

1. **Your app has an agent.** Users talk to it. It reads their data, analyzes it, takes actions.
2. **You earn from every interaction.** 60% of AGENT tokens spent on queries go to you.
3. **Your users can build on top of you.** They create sub-nodes. You earn referral revenue.
4. **The network gets cheaper as it grows.** More members = more volume = better wholesale LLM rates.
5. **Authentication creates a wallet.** Every social login (Google, Apple, Twitter) creates an embedded Arbitrum wallet via Privy. Users are co-op members from first click.

---

## The Co-Op Model

Casino is the builder. The [Open Inference Foundation](https://openinferencefoundation.org) is the co-op.

The foundation negotiates wholesale LLM rates with providers (Anthropic, OpenAI, Google). Members pay less than retail. The more members join, the more volume the co-op commands, the better rates it negotiates. The savings compound.

Individual users pay retail. The co-op pays wholesale. That's the structural advantage.

**Pseudonymous by design.** Users authenticate with a wallet, not an identity. The foundation's customer is a wallet address. No names, no emails, no query logs tied to real-world identity. You pay twice for AI today — once with money, once with data. The co-op only asks for money.

---

## Smart Contracts

All on Arbitrum mainnet:

| Contract | Address | Purpose |
|----------|---------|---------|
| INFER | [`0xD31f...`](https://arbiscan.io/address/0xD31f5765F92D7D3fF0463eeaa14C157d423aF9E1) | Membership token (1B fixed) |
| AGENT | [`0xee68...`](https://arbiscan.io/address/0xee68973c3320266486F2Fcf31a0196A7FB680418) | Compute token (governed mint) |
| InferStaking | [`0x5c55...`](https://arbiscan.io/address/0x5c550E2ad896c324342Def3F45606232d06AD563) | Tiered staking + discounts |
| AgentPaymentV3 | [`0xcB6d...`](https://arbiscan.io/address/0xcB6d809b518316c5E7af46CE19dc92B0e2cB352D) | Settlement (60/30/10 split) |
| AgentPurchase | [`0xebA9...`](https://arbiscan.io/address/0xebA937ECd0332E69400AB6dB2E15Ea7f8B643207) | Buy AGENT with USDC/USDT |
| SurplusDistribution | — | Quarterly Merkle-proof surplus claims |

Governed by a Gnosis Safe multisig. Settlement is automatic. Revenue splits are hardcoded in Solidity.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Casino is the reference implementation of the Flowstack SDK. Contributions to the UI, build pipeline UX, and developer experience are welcome. The backend (Sage) is private — contribute via SDK improvements and frontend PRs.

---

## License

MIT — Open Inference Foundation

---

**Casino is maintained by the [Open Inference Foundation](https://openinferencefoundation.org), a nonprofit inference cooperative. Every app built here becomes a node in the network. The network grows from the edges.**

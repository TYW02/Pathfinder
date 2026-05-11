# Pathfinder 🚀

Pathfinder helps users go from “I have an idea” to “I know exactly what to build next.” By combining LLM-powered planning, structured JSON outputs, user authentication, subscription-based model access, and dynamic visual roadmaps, Pathfinder transforms vague concepts into actionable product strategy.

## 🌟 Overview

Pathfinder is a full-stack AI SaaS application designed to generate:

- User Personas
- Core Features
- Feature Mapping
- User Journeys
- Development Roadmaps
- Mermaid Visual Diagrams (User Flow + Component Dependencies)

Users can input a project or app idea, and Pathfinder produces a strategic blueprint suitable for:

- Startup founders
- Students
- Product managers
- Indie hackers
- Developers building MVPs

## 🛠 Tech Stack
Frontend
React (Vite) Fast SPA architecture

JavaScript Component logic and state management

CSS / Custom UI Styling Gradient branding, responsive grid layouts, roadmap visualization

Mermaid.js Dynamic architecture + user flow diagrams

Supabase Auth (Frontend SDK) Authentication state management

Stripe Checkout Subscription payments (Free / Pro / Team)

Vercel Frontend deployment

### Backend
Python (Flask) API server and orchestration layer

Gunicorn Production WSGI server

Supabase (Postgres + Auth) User profiles, subscriptions, usage counters

Stripe Webhooks / Checkout Sessions Billing + subscription lifecycle

Hugging Face Inference API / Featherless AI Multi-model LLM integration

Render Backend deployment

### AI / Product Logic
Structured SYSTEM_PROMPT engineering for deterministic JSON
Multi-tier model routing by subscription plan
Usage-based rate limiting by plan
Mermaid diagram generation + PNG export

## 🧠 Key Features
### 1. AI Product Architect

Users submit an idea, and Pathfinder generates:

{
  "personas": [ ],
  "core_features": [ ],
  "feature_mapping": [ ],
  "user_journeys": [ ],
  "development_roadmap": [ ],
  "diagrams": { }
}

### 2. Subscription-Based AI Access
Free Tier
Basic model access
Monthly generation limits

Pro Tier
Higher-quality model
Increased usage quota

Team Tier
Premium generation volume
Designed for startup teams / agencies

### 3. Secure Authentication
Email/password sign-up
Supabase-managed sessions
Protected API endpoints via JWT

### 4. Visual Product Planning
Generated Mermaid diagrams include:

- User onboarding flow
- Technical architecture
- Dependency graphs

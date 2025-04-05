# BlvckXplr

<div align="center">

<div style="display: inline-block; margin: 0 10px;">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="40" height="40" />
  <img src="https://vitejs.dev/logo-with-shadow.png" alt="Vite" width="40" height="40" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="40" height="40" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" width="40" height="40" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40" />
</div>

<p align="center" style="margin: 30px 0;">
  <strong>A high-fidelity, modern interface foundation for Web3 and AI-based explorers, dashboards, and autonomous agent controllers.</strong>
</p>

<p align="center" style="margin-bottom: 40px;">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#use-cases">Use Cases</a> •
  <a href="#roadmap">Roadmap</a>
</p>

![BlvckXplr Dashboard](https://raw.githubusercontent.com/aminnizamdev/blvckxplr/main/preview.png)

</div>

<hr style="margin: 40px 0;" />

## Overview

**BlvckXplr** is not just another UI template — it's a production-ready foundation for professional-grade Web3 and LLM applications. Built with a dark minimalist aesthetic and designed around real-time responsiveness, component modularity, and visual clarity, BlvckXplr serves as the perfect frontend shell for your intelligent systems.

Whether you're building a crypto dashboard, token explorer, or AI agent interface, BlvckXplr provides the clean, scalable foundation you need to bring your vision to life.

<div align="center" style="margin: 30px 0;">
  <table>
    <tr>
      <td align="center"><strong>Real-time Updates</strong></td>
      <td align="center"><strong>Modular Design</strong></td>
      <td align="center"><strong>Developer-First</strong></td>
    </tr>
    <tr>
      <td align="center">Live data visualization with WebSocket support</td>
      <td align="center">Component-based architecture for maximum flexibility</td>
      <td align="center">Built with DX in mind for rapid iteration</td>
    </tr>
  </table>
</div>

## Project Purpose

BlvckXplr was created with two primary goals:

### Foundation UI for Agentic Systems
A responsive, beautiful, and modular interface designed to pair seamlessly with intelligent agents — including crypto scanners, trading bots, or monitoring systems — providing an elegant visual layer for displaying real-time information.

### Design-First Web3 Explorer Template
A visually stunning shell built to showcase token data, price feeds, or protocol interactions with minimal clutter, ready to integrate with live APIs like Solana, Ethereum, or Pyth Network.

<div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
<strong>Built for the intersection of design and functionality</strong><br/>
BlvckXplr balances aesthetic excellence with developer ergonomics, providing both a stunning visual experience and a clean codebase.
</div>

## Architecture & Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Core Framework** | React + TypeScript | Strong typing and modular component architecture |
| **Build Tool** | Vite | Ultra-fast dev server and modern bundling |
| **Styling** | Tailwind CSS + ShadCN/UI | Utility-first CSS with elegant, prebuilt components |
| **Component System** | Radix UI + ShadCN | Accessibility-first headless components |
| **Package Management** | pnpm / npm | Fast, reliable dependency management |
| **Development** | Vite Dev Server | Live reload with fast HMR |
| **Structure** | Clean MVC-style | Organized for scalability and maintainability |

## Features

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
    <h3>UI/UX Elements</h3>
    <ul>
      <li><strong>Dark Mode Aesthetic</strong> — High contrast, eye-friendly dark theme with carefully balanced color palettes</li>
      <li><strong>Typography System</strong> — Precision font sizing, line heights, and spacing for maximum readability</li>
      <li><strong>Component Library</strong> — Pre-built buttons, tabs, cards, and modals powered by ShadCN</li>
      <li><strong>Layout Grid</strong> — Responsive, flexible grid system for perfect positioning across all screen sizes</li>
      <li><strong>Transitions & Animations</strong> — Subtle, meaningful animations that enhance the user experience</li>
      <li><strong>Icon System</strong> — Comprehensive icon set ready for your navigation and action elements</li>
    </ul>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
    <h3>Technical Capabilities</h3>
    <ul>
      <li><strong>Modular Architecture</strong> — Easily inject custom widgets, dashboards, or data panels</li>
      <li><strong>Stateless UI Layer</strong> — Design philosophy that makes backend integration straightforward</li>
      <li><strong>Responsive Design</strong> — Seamless experience from mobile to desktop</li>
      <li><strong>Accessibility</strong> — ARIA-compliant with keyboard navigation support</li>
      <li><strong>Developer Experience</strong> — Hot-reloading workflow with instant previews</li>
      <li><strong>Performance Optimized</strong> — Minimal bundle size and efficient rendering</li>
    </ul>
  </div>
</div>

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/aminnizamdev/blvckxplr.git
```

2. **Navigate to the project directory**

```bash
cd blvckxplr
```

3. **Install dependencies**

```bash
npm install
# or
pnpm install
```

4. **Start the development server**

```bash
npm run dev
# or
pnpm dev
```

5. **Open your browser**

Your development server will be running at:
```
http://localhost:5173/
```

## Project Structure

```
blvckxplr/
├── public/             # Static assets and resources
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Base UI elements (buttons, inputs, etc.)
│   │   ├── dashboard/  # Dashboard-specific components
│   │   └── layout/     # Layout components (header, sidebar, etc.)
│   ├── pages/          # Page components for routing
│   ├── lib/            # Utilities and helper functions
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies and scripts
```

## Use Cases

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center;">
    <h3>AI-Powered Dashboards</h3>
    <p>Visual interfaces for LLM agents and autonomous systems</p>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center;">
    <h3>Crypto/DeFi Applications</h3>
    <p>Token explorers, portfolio trackers, or trading interfaces</p>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center;">
    <h3>Real-Time Data Platforms</h3>
    <p>Live feeds from Web3 protocols or off-chain data sources</p>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center;">
    <h3>Agent Control Panels</h3>
    <p>Monitoring and interaction UIs for watcher agents or scanners</p>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center;">
    <h3>Developer Playgrounds</h3>
    <p>Component testing with integrated WebSocket feeds</p>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center;">
    <h3>Analytics Interfaces</h3>
    <p>Data visualization and reporting dashboards</p>
  </div>
</div>

## Development Workflow

### Available Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint to check for code quality issues
- `npm run type-check` — Run TypeScript compiler to check for type errors

### Customization

- **Theming**: Modify the Tailwind configuration in `tailwind.config.js`
- **Components**: Customize or extend existing components in the `src/components` directory
- **Data Integration**: Connect to your backend or data sources in the appropriate service files

## Current Status

<div align="center" style="margin: 30px 0;">
  <table style="width: 80%;">
    <tr>
      <th style="width: 50%;">Component</th>
      <th style="width: 50%;">Status</th>
    </tr>
    <tr>
      <td>UI Layout</td>
      <td><span style="color: #4CAF50;">✓ Implemented</span></td>
    </tr>
    <tr>
      <td>ShadCN Integration</td>
      <td><span style="color: #4CAF50;">✓ Complete</span></td>
    </tr>
    <tr>
      <td>Build System</td>
      <td><span style="color: #4CAF50;">✓ Ready</span></td>
    </tr>
    <tr>
      <td>Backend Wiring</td>
      <td><span style="color: #FFC107;">⟳ Planned</span></td>
    </tr>
    <tr>
      <td>Data Integration</td>
      <td><span style="color: #FFC107;">⟳ Planned</span></td>
    </tr>
    <tr>
      <td>Dashboard Variants</td>
      <td><span style="color: #2196F3;">⟲ In Progress</span></td>
    </tr>
  </table>
</div>

## Roadmap

<div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
  <h3>Q2 2025</h3>
  <ul>
    <li>[ ] <strong>Agent Integration</strong> — Connect with Watcher Agent output systems</li>
    <li>[ ] <strong>Real-Time Scanner</strong> — Add token launch scanner functionality</li>
  </ul>
  
  <h3>Q3 2025</h3>
  <ul>
    <li>[ ] <strong>Data Visualization</strong> — Implement animated dashboard graphs with Recharts/Visx</li>
    <li>[ ] <strong>Authentication</strong> — Add wallet connection and role-based agent views</li>
  </ul>
  
  <h3>Q4 2025</h3>
  <ul>
    <li>[ ] <strong>Theming System</strong> — Expand theming options beyond the default dark mode</li>
    <li>[ ] <strong>Documentation</strong> — Comprehensive component and integration documentation</li>
  </ul>
</div>

## Project Philosophy

BlvckXplr is built on the belief that interfaces for advanced systems should be as sophisticated as the technology they represent, yet remain intuitive and accessible. By providing a polished foundation for agentic applications, BlvckXplr aims to accelerate the development of next-generation Web3 and AI tools.

## License

This project is released under the [MIT License](LICENSE).

## Creator

**Amin Nizam**  
Self-taught AI/crypto automation builder  
[@aminnizamdev](https://github.com/aminnizamdev)

---

<div align="center">

<p style="font-size: 18px; margin: 40px 0;"><strong>BlvckXplr</strong> — Where Intelligence Meets Interface</p>

<div style="margin-top: 20px;">
  <a href="https://github.com/aminnizamdev/blvckxplr/stargazers"><img src="https://img.shields.io/github/stars/aminnizamdev/blvckxplr?style=flat-square" alt="GitHub stars"></a>
  <a href="https://github.com/aminnizamdev/blvckxplr/network/members"><img src="https://img.shields.io/github/forks/aminnizamdev/blvckxplr?style=flat-square" alt="GitHub forks"></a>
  <a href="https://github.com/aminnizamdev/blvckxplr/issues"><img src="https://img.shields.io/github/issues/aminnizamdev/blvckxplr?style=flat-square" alt="GitHub issues"></a>
  <a href="https://github.com/aminnizamdev/blvckxplr/blob/main/LICENSE"><img src="https://img.shields.io/github/license/aminnizamdev/blvckxplr?style=flat-square" alt="GitHub license"></a>
</div>

</div>

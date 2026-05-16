# DocSync Web Interface

A modern React-based web interface for DocSync - the documentation synchronization tool.

## Features

- 📁 **File Tree**: Browse repository files with status indicators
- 📄 **Document Viewer**: View and preview markdown documentation
- 🔍 **Analysis Panel**: AI-powered detection of outdated documentation
- 🎨 **Dark Theme**: Beautiful dark UI optimized for long coding sessions
- ⚡ **Fast**: Built with Vite for lightning-fast development

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Dark Theme** - Custom dark color palette

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
web/
├── src/
│   ├── App.jsx              # Main app with 3-column layout
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles with Tailwind
│   └── components/
│       ├── FileTree.jsx     # Left panel - file browser
│       ├── DocViewer.jsx    # Middle panel - document viewer
│       ├── AnalysisPanel.jsx # Right panel - AI analysis
│       └── StatusBadge.jsx  # Reusable status indicator
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies
```

## Layout

The app uses a responsive 3-column layout:

- **Left (25%)**: File tree with status indicators
- **Middle (45%)**: Document viewer with syntax highlighting
- **Right (30%)**: Analysis panel with AI-detected issues

## Color Scheme

- Background: `#0f0f0f`
- Surface: `#1a1a1a`
- Border: `#2a2a2a`
- Text: `#ffffff`
- Muted: `#a0a0a0`

## Made with Bob

Built with ❤️ using Bob AI Assistant
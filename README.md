# CSS Gradient Generator

A powerful and interactive CSS gradient generator built with Next.js, React, and TypeScript. Create beautiful gradients with advanced controls, real-time preview, and export capabilities.

## Features

- 🎨 **Interactive Gradient Editor**: Create linear and radial gradients with intuitive controls
- 🎯 **Real-time Preview**: See your gradients update instantly as you make changes
- 🌈 **Advanced Color Controls**: Fine-tune colors with precision using various color pickers
- 📐 **Mesh Gradient Support**: Create complex mesh gradients with customizable control points
- 🎬 **Animation Support**: Add smooth animations to your gradients
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 💾 **Export Options**: Save gradients as CSS, images, or animated formats
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📋 **Copy to Clipboard**: Easily copy CSS code for use in your projects

## Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Material-UI (MUI) 7.3.2
- **Color Picking**: React Color
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd css-gradient-clone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main gradient generator page
└── components/         # Reusable React components
    ├── Camera.tsx      # Camera functionality
    ├── ColorPicker.tsx # Color selection component
    ├── GradientControls.tsx # Gradient control panel
    ├── GradientGenerator.tsx # Main generator component
    ├── GradientPreview.tsx # Gradient preview display
    └── ...             # Other utility components
```

## Features in Detail

### Gradient Types
- **Linear Gradients**: Create gradients along a straight line
- **Radial Gradients**: Create circular or elliptical gradients
- **Mesh Gradients**: Advanced gradients with multiple control points

### Color Management
- Multiple color picker interfaces
- HSL, RGB, and hex color support
- Color history and favorites
- Opacity controls

### Export Options
- CSS code generation
- PNG/JPG image export
- Animated GIF creation
- MP4 video export
- Wallpaper generation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Material-UI](https://mui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Color picking with [React Color](https://casesandberg.github.io/react-color/)

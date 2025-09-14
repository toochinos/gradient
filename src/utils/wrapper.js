export function generateWrapper(cssString, format) {
  if (format === "react") {
    return generateReactWrapper(cssString);
  } else {
    return generateHTMLWrapper(cssString);
  }
}

function generateHTMLWrapper(cssString) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Gradient Export</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }

        .gradient-container {
            width: 100%;
            height: 100%;
            ${cssString}
        }
    </style>
</head>
<body>
    <div class="gradient-container"></div>
</body>
</html>`;
}

function generateReactWrapper(cssString) {
  // Check if this is an animated gradient (contains keyframes and layer structures)
  const isAnimated = cssString.includes('@keyframes') && cssString.includes('individual-layer');

  if (isAnimated) {
    // For animated gradients, use the complete structure with inline styles and CSS
    const cleanedCSS = cssString.replace(/height: 400px;/g, 'height: 100vh;');

    return `import React from 'react';

const MeshGradient = () => {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    zIndex: -1,
    overflow: 'hidden'
  };

  return (
    <>
      <div style={containerStyle}>
        <div className="mesh-gradient">
          <div className="individual-layer-1"></div>
          <div className="individual-layer-2"></div>
          <div className="individual-layer-3"></div>
        </div>
      </div>
      <style>{\`
        ${cleanedCSS}
      \`}</style>
    </>
  );
};

export default MeshGradient;`;
  } else {
    // For static gradients, use simple structure with regular CSS
    return `import React from 'react';

const MeshGradient = () => {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    zIndex: -1,
    overflow: 'hidden'
  };

  return (
    <>
      <div style={containerStyle} className="mesh-gradient" />
      <style>{\`
        .mesh-gradient {
          width: 100%;
          height: 100%;
          ${cssString}
        }
      \`}</style>
    </>
  );
};

export default MeshGradient;`;
  }
}

export function makeBlobUrl(content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function downloadString(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
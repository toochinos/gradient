'use client';

import dynamic from 'next/dynamic';

const WebGLUnifiedSceneRecorder = dynamic(() => import('@/components/WebGLUnifiedSceneRecorder'), { ssr: false });

export default function UnifiedRecorderPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-6">Unified WebGL Recorder (Gradient + Three.js)</h1>
        <p className="text-gray-400 mb-4">Renders gradient as a shader and a Three.js mesh in the same canvas. Records to WebM via MediaRecorder.</p>
        <WebGLUnifiedSceneRecorder width={1280} height={720} frameRate={30} />
      </div>
    </div>
  );
}

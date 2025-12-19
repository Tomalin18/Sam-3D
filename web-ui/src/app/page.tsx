"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Box, CheckCircle2, Loader2, Download, Eye, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the viewer to avoid SSR issues
const SplatViewer = dynamic(() => import("@/components/SplatViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-black/40 rounded-2xl flex items-center justify-center animate-pulse border border-white/5">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
        <p className="text-gray-400 font-medium tracking-wide">Initializing 3D Viewer...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [resultFile, setResultFile] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setResultFile(null);
      setStatus("idle");
      setShowViewer(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:3001/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Prediction failed");

      const data = await response.json();
      setStatus("processing");

      setResultFile(data.filename);
      setStatus("done");
      setShowViewer(true);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const downloadResult = () => {
    if (resultFile) {
      window.open(`http://localhost:3001/api/download/${resultFile}`, "_blank");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 lg:p-20 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-4 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-2 uppercase tracking-widest">
            AI View Synthesis Playground
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight gradient-text">
            SHARP 3D Engine
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Upload any photo and watch it materialize into a photorealistic 3D Gaussian Splat scene in real-time.
          </p>
        </header>

        {/* Main Interface */}
        <div className="glass-card p-4 md:p-8">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-800 rounded-[2rem] p-20 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <div className="relative w-20 h-20 mx-auto mb-8">
                <Upload className="w-full h-full text-gray-700 group-hover:text-blue-500 transition-colors" />
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
              </div>
              <p className="text-2xl font-semibold text-gray-300">Start your creation</p>
              <p className="text-gray-500 mt-3 font-medium">Drag & drop or click to upload</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 overflow-hidden border border-white/10 shrink-0">
                    <img src={preview} alt="Small Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-200 truncate max-w-[200px]">{file?.name}</h3>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
                      {status === 'done' ? 'Generation Complete' : 'Image Ready'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {status === "idle" && (
                    <button
                      onClick={handleUpload}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2"
                    >
                      <Box className="w-5 h-5" /> Generate 3D
                    </button>
                  )}

                  {(status === "uploading" || status === "processing") && (
                    <div className="flex items-center gap-3 bg-white/5 py-3 px-6 rounded-xl border border-white/10">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-sm font-bold text-gray-300">
                        {status === "uploading" ? "Broadcasting Image..." : "AI Engine Running..."}
                      </span>
                    </div>
                  )}

                  {status === "done" && (
                    <>
                      <button
                        onClick={() => setShowViewer(!showViewer)}
                        className={`py-3 px-6 rounded-xl font-bold transition-all flex items-center gap-2 ${showViewer ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        <Eye className="w-5 h-5" /> {showViewer ? 'Show Image' : 'Preview 3D'}
                      </button>
                      <button
                        onClick={downloadResult}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" /> .PLY
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { setPreview(null); setFile(null); setStatus("idle"); setShowViewer(false); }}
                    className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-white/5"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewport Area */}
              <div className="relative aspect-video md:aspect-[21/9] lg:aspect-config rounded-3xl overflow-hidden bg-black/60 shadow-2xl border border-white/5 min-h-[400px]">
                {showViewer && resultFile ? (
                  <SplatViewer url={`http://localhost:3001/outputs/${resultFile}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <img src={preview} alt="Full Preview" className="w-full h-full object-contain opacity-40 blur-sm absolute" />
                    <img src={preview} alt="Main Preview" className="h-full object-contain z-10 relative" />
                  </div>
                )}

                {status === "processing" && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl animate-pulse opacity-50" />
                        <Loader2 className="w-full h-full animate-spin text-blue-500 relative" />
                      </div>
                      <p className="text-2xl font-black text-white uppercase tracking-tighter italic">Processing AI Model</p>
                      <p className="text-gray-400 font-medium">Estimated time: ~1.2 seconds</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
          <FeatureCard
            icon={<Box className="w-6 h-6 text-blue-500" />}
            title="3D Gaussian Splatting"
            desc="The state-of-the-art representation for photorealistic radiosity rendering."
          />
          <FeatureCard
            icon={<Loader2 className="w-6 h-6 text-purple-500" />}
            title="Monocular Recovery"
            desc="Recover metric 3D structure from any single photograph automatically."
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
            title="Real-time Interaction"
            desc="Explore your generated scenes instantly with our integrated 3D renderer."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-6 border-white/5 hover:border-blue-500/20 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

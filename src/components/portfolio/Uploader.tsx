'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AssetUploader() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Ingestion failed');
      const data = await res.json();
      setSuccess(`Optimized WebP published to Cloud Storage: ${data.asset.url}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.tiff'] },
    multiple: false,
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-amber-400 bg-amber-400/5' : 'border-neutral-800 hover:border-amber-400/50 bg-neutral-950'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
        <h3 className="font-bold text-white text-base mb-1">Upload Cinematic Assets</h3>
        <p className="text-neutral-500 text-xs">Drop RAW, TIFF, PNG, or JPG (Uploader converts it to WebP 4K)</p>
      </div>

      {uploading && (
        <div className="mt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent" />
          <span className="text-xs text-neutral-400">Processing visual rendering matrix and extracting EXIF telemetry...</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-300 break-all">{success}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-300">{error}</p>
        </div>
      )}
    </div>
  );
}

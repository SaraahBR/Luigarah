"use client";

interface SimpleLoaderProps {
  isLoading: boolean;
}

export default function SimpleLoader({ isLoading }: SimpleLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900"></div>
    </div>
  );
}
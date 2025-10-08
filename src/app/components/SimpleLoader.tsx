"use client";

interface SimpleLoaderProps {
  isLoading: boolean;
}

export default function SimpleLoader({ isLoading }: SimpleLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    </div>
  );
}
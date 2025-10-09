"use client";

import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function BuscaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            <span className="ml-3 text-gray-600">Carregando resultados...</span>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
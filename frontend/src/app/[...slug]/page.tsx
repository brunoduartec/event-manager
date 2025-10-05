"use client";
import { useParams } from "next/navigation";

export default function DynamicPage() {
  const params = useParams();
  // params.slug será um array com os segmentos do path
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold text-orange-600 mt-8 mb-2 text-center">pizza party</h1>
        <div className="p-8 mt-6 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-orange-800">Página dinâmica</h2>
          <div className="text-gray-700">Path parameters: <span className="font-mono">{JSON.stringify(params.slug)}</span></div>
        </div>
      </div>
    </main>
  );
}

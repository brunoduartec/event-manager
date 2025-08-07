"use client";
import { useEffect, useState } from "react";

import Header from "../components/Header";
import NomeAlert from "../components/NomeAlert";
import ItemTable from "../components/ItemTable";
import NomeInput from "../components/NomeInput";
import { Skeleton } from "../components/ui/skeleton";
import { Spinner } from "../components/ui/spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "__API_URL__";


export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // item em ação

  // Lê o nome do localStorage apenas no client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const nomeSalvo = localStorage.getItem("nome") || "";
      setNome(nomeSalvo);
    }
  }, []);

  useEffect(() => {
    if (!nome) return;
    setLoading(true);
    fetch(`${API_URL}/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, [nome]);

  const handleTrocarNome = () => {
    localStorage.removeItem("nome");
    setNome("");
  };

  const handleLevar = (item: string) => {
    setActionLoading(item);
    fetch(`${API_URL}/items/${encodeURIComponent(item)}/levar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(() => {
        fetch(`${API_URL}/items`)
          .then(res => res.json())
          .then(data => setItems(data));
      })
      .catch(async (err) => {
        let msg = "Erro ao levar item.";
        if (err.json) {
          const data = await err.json();
          msg = data?.error || msg;
        }
        alert(msg);
      })
      .finally(() => setActionLoading(null));
  };

  const handleDesistir = (item: string) => {
    setActionLoading(item);
    fetch(`${API_URL}/items/${encodeURIComponent(item)}/desistir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(() => {
        fetch(`${API_URL}/items`)
          .then(res => res.json())
          .then(data => setItems(data));
      })
      .catch(async (err) => {
        let msg = "Erro ao desistir.";
        if (err.json) {
          const data = await err.json();
          msg = data?.error || msg;
        }
        alert(msg);
      })
      .finally(() => setActionLoading(null));
  };

  if (!nome) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
        <div className="w-full max-w-2xl">
          <Header />
          <NomeInput onSave={setNome} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="w-full max-w-3xl">
        <Header />
        <NomeAlert nome={nome} onTrocar={handleTrocarNome} />
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <ItemTable
            items={items}
            nome={nome}
            onLevar={handleLevar}
            onDesistir={handleDesistir}
            actionLoading={actionLoading}
            Spinner={Spinner}
          />
        )}
      </div>
    </main>
  );
}

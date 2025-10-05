"use client";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "__API_URL__";

export default function ConfigurarEventoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState({ item: "", quantidade: 1, unidade: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  // Novo item
  const [newItem, setNewItem] = useState({ item: "", quantidade: 1, unidade: "" });
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");
  // Deletar item
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const handleDelete = async (itemName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o item "${itemName}"?`)) return;
    setDeleting(itemName);
    setDeleteError("");
    try {
      const res = await fetch(`${API_URL}/items/${encodeURIComponent(itemName)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Erro ao deletar item");
      setItems(items => items.filter(it => it.item !== itemName));
    } catch (err: any) {
      setDeleteError(err.message || "Erro desconhecido ao deletar");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      const start = Date.now();
      const res = await fetch(`${API_URL}/items`);
      const data = await res.json();
      setItems(data);
      const elapsed = Date.now() - start;
      const minDelay = 400;
      if (elapsed < minDelay) {
        setTimeout(() => setLoading(false), minDelay - elapsed);
      } else {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const startEdit = (idx: number) => {
    setEditIndex(idx);
    setEditItem({
      item: items[idx].item,
      quantidade: items[idx].quantidade,
      unidade: items[idx].unidade,
    });
    setSuccess("");
    setError("");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditItem({ ...editItem, [e.target.id]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  };

  const saveEdit = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`${API_URL}/items/${encodeURIComponent(editItem.item)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: editItem.quantidade, unidade: editItem.unidade }),
      });
      if (!res.ok) throw new Error("Erro ao salvar edição");
      setSuccess("Item atualizado com sucesso!");
      setItems(items => items.map((it, i) => i === editIndex ? { ...it, ...editItem } : it));
      setEditIndex(null);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.id]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  };

  const addNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddSuccess("");
    setAddError("");
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar item");
      setAddSuccess("Item cadastrado com sucesso!");
      setItems(items => [...items, { ...newItem }]);
      setNewItem({ item: "", quantidade: 1, unidade: "" });
    } catch (err: any) {
      setAddError(err.message || "Erro desconhecido");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold text-orange-600 mt-8 mb-2 text-center">pizza party</h1>
        <Header />
        <Card className="p-8 mt-6">
          <h2 className="text-xl font-bold mb-4 text-orange-800">Configurar evento</h2>
          {/* Formulário de novo item */}
          <form onSubmit={addNewItem} className="flex flex-col gap-3 items-stretch mb-8 w-full">
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Label htmlFor="item" className="md:w-32 w-full">Nome</Label>
              <Input id="item" value={newItem.item} onChange={handleNewChange} required disabled={adding} className="w-full md:max-w-xs" />
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Label htmlFor="quantidade" className="md:w-32 w-full">Quantidade</Label>
              <Input id="quantidade" type="number" min={1} value={newItem.quantidade} onChange={handleNewChange} required disabled={adding} className="w-full md:max-w-xs" />
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Label htmlFor="unidade" className="md:w-32 w-full">Unidade</Label>
              <Input id="unidade" value={newItem.unidade} onChange={handleNewChange} required disabled={adding} className="w-full md:max-w-xs" />
            </div>
            <Button type="submit" className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold w-full md:w-auto mt-2" disabled={adding}>{adding ? "Cadastrando..." : "Cadastrar"}</Button>
          </form>
          {addSuccess && <div className="text-green-700 text-sm mb-2">{addSuccess}</div>}
          {addError && <div className="text-red-700 text-sm mb-2">{addError}</div>}
          {loading ? (
            <div className="space-y-6 animate-pulse" aria-label="Carregando itens">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b pb-4 flex flex-col md:flex-row gap-2 items-center">
                  <div className="bg-orange-100 rounded w-32 h-6 mb-2 md:mb-0" />
                  <div className="bg-orange-100 rounded w-32 h-6 mb-2 md:mb-0" />
                  <div className="bg-orange-100 rounded w-32 h-6 mb-2 md:mb-0" />
                  <div className="bg-orange-200 rounded h-10 w-24" />
                  <div className="bg-orange-200 rounded h-10 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((it, idx) => (
                <div key={it.item} className="border-b pb-4">
                  {editIndex === idx ? (
                    <form className="flex flex-col gap-3 items-stretch w-full" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                      <div className="flex flex-col md:flex-row gap-2 w-full">
                        <Label htmlFor="item" className="md:w-32 w-full">Nome</Label>
                        <Input id="item" value={editItem.item} disabled className="w-full md:max-w-xs" />
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full">
                        <Label htmlFor="quantidade" className="md:w-32 w-full">Quantidade</Label>
                        <Input id="quantidade" type="number" min={1} value={editItem.quantidade} onChange={handleEditChange} className="w-full md:max-w-xs" />
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full">
                        <Label htmlFor="unidade" className="md:w-32 w-full">Unidade</Label>
                        <Input id="unidade" value={editItem.unidade} onChange={handleEditChange} className="w-full md:max-w-xs" />
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full">
                        <Button type="submit" className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold w-full md:w-auto mt-2" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                        <Button type="button" variant="outline" onClick={() => setEditIndex(null)} disabled={saving} className="w-full md:w-auto mt-2">Cancelar</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-2 items-center">
                      <span className="font-semibold text-orange-900 w-32">{it.item}</span>
                      <span className="w-32">{it.quantidade}</span>
                      <span className="w-32">{it.unidade}</span>
                      <Button onClick={() => startEdit(idx)} className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold">Editar</Button>
                      <Button
                        onClick={() => handleDelete(it.item)}
                        className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={deleting === it.item}
                      >
                        {deleting === it.item ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {success && <div className="text-green-700 text-sm mt-2">{success}</div>}
              {error && <div className="text-red-700 text-sm mt-2">{error}</div>}
              {deleteError && <div className="text-red-700 text-sm mt-2">{deleteError}</div>}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

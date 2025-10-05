import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface NomeInputProps {
  onSave: (nome: string) => void;
}

export default function NomeInput({ onSave }: NomeInputProps) {
  const [nome, setNome] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    localStorage.setItem("nome", nome.trim());
    onSave(nome.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex items-center gap-4 justify-center">
      <Label htmlFor="nome">Digite seu nome:</Label>
      <Input
        type="text"
        id="nome"
        className="max-w-xs"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />
      <Button type="submit">Entrar</Button>
    </form>
  );
}

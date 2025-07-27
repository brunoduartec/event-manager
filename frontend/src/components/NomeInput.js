import { useState } from 'react';

export default function NomeInput({ onSave }) {
  const [nome, setNome] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    localStorage.setItem("nome", nome.trim());
    onSave(nome.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 d-flex align-items-center gap-2">
      <label htmlFor="nome" className="form-label mb-0">Digite seu nome:</label>
      <input
        type="text"
        id="nome"
        className="form-control"
        style={{ maxWidth: 200 }}
        value={nome}
        onChange={e => setNome(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">Entrar</button>
    </form>
  );
}
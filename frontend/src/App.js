import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import NomeAlert from './components/NomeAlert';
import ItemTable from './components/ItemTable';
import NomeInput from './components/NomeInput';

const API_URL = process.env.REACT_APP_API_URL || '__API_URL__';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState(localStorage.getItem("nome") || "");

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

  const handleLevar = (item) => {
    fetch(`${API_URL}/items/${encodeURIComponent(item)}/levar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(() => {
        // Refaz o fetch dos itens para garantir consistência
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
      });
  };

  const handleDesistir = (item) => {
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
      });
  };

  if (!nome) {
    return (
      <div className="container py-4">
        <Header />
        <NomeInput onSave={setNome} />
      </div>
    );
  }

  if (loading) {
    return <div className="container text-center py-5"><p>Carregando...</p></div>;
  }

  return (
    <main className="container py-4">
      <Header />
      <NomeAlert 
        nome={nome}
        onTrocar={handleTrocarNome}
      />
      <ItemTable
        items={items}
        nome={nome}
        onLevar={handleLevar}
        onDesistir={handleDesistir}
      />
    </main>
  );
}

export default App;
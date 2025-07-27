export default function NomeAlert({ nome, onTrocar }) {
  return (
    <div className="alert alert-success d-flex justify-content-between align-items-center">
      <span className="mb-0">Participando como: <strong>{nome}</strong></span>
      <button className="btn btn-outline-secondary btn-sm" onClick={onTrocar}>
        Trocar nome
      </button>
    </div>
  );
}
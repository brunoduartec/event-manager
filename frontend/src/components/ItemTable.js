export default function ItemTable({ items, nome, onLevar, onDesistir }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body space-y-4">
        {items.map(item => {
          const { item: nomeItem, quantidade, unidade, quemVaiLevar = [] } = item;
          const jaVaiLevar = quemVaiLevar.includes(nome);
          const podeLevarMais = quemVaiLevar.length < quantidade;
          const cardClass = podeLevarMais
            ? "border rounded p-3 shadow-sm bg-white"
            : "border rounded p-3 shadow-sm bg-success bg-opacity-25";

          return (
            <div key={nomeItem} className={cardClass}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">{nomeItem}</h5>
                <small className="text-muted">{quantidade} {unidade}</small>
              </div>
              <div className="mb-2">
                <strong>Quem vai levar:</strong> {quemVaiLevar.length > 0 ? quemVaiLevar.join(', ') : '—'}
              </div>
              <div>
                {jaVaiLevar ? (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDesistir(nomeItem)}
                  >
                    Desistir
                  </button>
                ) : (
                  podeLevarMais && (
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => onLevar(nomeItem)}
                    >
                      Levar
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
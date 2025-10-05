import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface Item {
  item: string;
  quantidade: number;
  unidade: string;
  quemVaiLevar: { nome: string }[];
}

interface ItemTableProps {
  items: Item[];
  nome: string;
  onLevar: (item: string) => void;
  onDesistir: (item: string) => void;
  actionLoading?: string | null;
  Spinner?: React.FC<{ className?: string }>;
}

export default function ItemTable({ items, nome, onLevar, onDesistir, actionLoading, Spinner }: ItemTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item => {
        const { item: nomeItem, quantidade, unidade, quemVaiLevar = [] } = item;
        const entry = quemVaiLevar.find(obj => obj.nome === nome);
        const jaVaiLevar = !!entry;
        const podeLevarMais = !jaVaiLevar && quemVaiLevar.length === 0;
        const isLoading = actionLoading === nomeItem;

        return (
          <Card key={nomeItem} className={podeLevarMais ? "bg-white" : "bg-green-100 border-green-300"}>
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-lg font-semibold text-orange-800">{nomeItem}</h5>
              <span className="text-sm text-gray-500">{quantidade} {unidade}</span>
            </div>
            <div className="mb-2">
              <strong>Quem vai levar:</strong> {quemVaiLevar.length > 0 ? quemVaiLevar.map(obj => obj.nome).join(', ') : '—'}
            </div>
            <div>
              {jaVaiLevar ? (
                <Button variant="destructive" className="h-8 px-3 py-1 text-sm" onClick={() => onDesistir(nomeItem)} disabled={isLoading}>
                  {isLoading && Spinner ? <Spinner className="mr-2" /> : null}
                  Desistir
                </Button>
              ) : (
                podeLevarMais && (
                  <Button variant="outline" className="h-8 px-3 py-1 text-sm" onClick={() => onLevar(nomeItem)} disabled={isLoading}>
                    {isLoading && Spinner ? <Spinner className="mr-2" /> : null}
                    Levar
                  </Button>
                )
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

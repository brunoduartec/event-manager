import { Button } from "./ui/button";
import { Alert } from "./ui/alert";

interface NomeAlertProps {
  nome: string;
  onTrocar: () => void;
}

export default function NomeAlert({ nome, onTrocar }: NomeAlertProps) {
  return (
    <Alert className="mb-6 flex justify-between items-center bg-green-50 border-green-300 text-green-900">
      <span>Participando como: <strong>{nome}</strong></span>
      <Button variant="outline" onClick={onTrocar}>Trocar nome</Button>
    </Alert>
  );
}

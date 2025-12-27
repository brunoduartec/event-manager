import { Card } from "./ui/card";

export default function Header() {
  return (
    <Card className="mb-6 text-center bg-gradient-to-r from-yellow-200 to-orange-100 border-0 shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold text-orange-700 tracking-tight">Noite da Pizza 🍕</h1>
    </Card>
  );
}

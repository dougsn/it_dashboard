import { BulkDeviceForm } from "@/components/bulk-device-form";
import { Topbar } from "@/components/topbar";

export default function BulkDevicePage() {
  return (
    <>
      <Topbar
        title="Adicionar em Lote"
        subtitle="Cadastre múltiplos dispositivos a partir de um range de IPs"
        back="/devices"
      />
      <div className="p-7">
        <BulkDeviceForm />
      </div>
    </>
  );
}

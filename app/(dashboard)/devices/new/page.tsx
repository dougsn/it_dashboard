import { DeviceForm } from "@/components/device-form";
import { Topbar } from "@/components/topbar";

export default function NewDevicePage() {
  return (
    <>
      <Topbar
        title="Novo Dispositivo"
        subtitle="Cadastre um novo equipamento para monitoramento"
        back="/devices"
      />
      <div className="p-7">
        <DeviceForm />
      </div>
    </>
  );
}

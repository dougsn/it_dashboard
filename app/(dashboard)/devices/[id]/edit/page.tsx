import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { DeviceForm } from "@/components/device-form";
import { Topbar } from "@/components/topbar";

export default async function EditDevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const device = await db.device.findUnique({ where: { id } });

  if (!device) notFound();

  return (
    <>
      <Topbar
        title="Editar Dispositivo"
        subtitle={device.name}
        back={`/devices/${id}`}
      />
      <div className="p-7">
        <DeviceForm device={device} />
      </div>
    </>
  );
}

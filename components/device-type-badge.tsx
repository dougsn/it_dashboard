import { Badge } from "@/components/ui/badge";
import { Router, Camera, Tv, HelpCircle, Wifi, RadioTower } from "lucide-react";
import type { DeviceType } from "@prisma/client";

const config: Record<DeviceType, { label: string; icon: React.ElementType }> = {
  MIKROTIK: { label: "Mikrotik",        icon: Router      },
  DVR:      { label: "DVR",             icon: Tv          },
  CAMERA:   { label: "Câmera",          icon: Camera      },
  OTHER:    { label: "Outro",           icon: HelpCircle  },
  UNIFI_AP: { label: "UniFi AP",        icon: Wifi        },
  OMADA_AP: { label: "Omada AP",        icon: RadioTower  },
};

export function DeviceTypeBadge({ type }: { type: DeviceType }) {
  const { label, icon: Icon } = config[type];
  return (
    <Badge variant="secondary" className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

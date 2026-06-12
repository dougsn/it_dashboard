import { Router, HardDrive, Camera, Box, Wifi, RadioTower } from "lucide-react";
import type { DeviceType } from "@prisma/client";

export const DEVICE_TYPE_ICON: Record<DeviceType, React.ElementType> = {
  MIKROTIK: Router,
  DVR:      HardDrive,
  CAMERA:   Camera,
  OTHER:    Box,
  UNIFI_AP: Wifi,
  OMADA_AP: RadioTower,
};

export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  MIKROTIK: "Mikrotik",
  DVR:      "DVR",
  CAMERA:   "Câmera",
  OTHER:    "Outro",
  UNIFI_AP: "UniFi AP",
  OMADA_AP: "Omada AP",
};

export const DEVICE_TYPE_ICON_BG: Record<DeviceType, string> = {
  MIKROTIK: "bg-primary/10 text-primary",
  DVR:      "bg-warning/10 text-warning",
  CAMERA:   "bg-destructive/10 text-destructive",
  OTHER:    "bg-muted text-muted-foreground",
  UNIFI_AP: "bg-sky-500/10 text-sky-500",
  OMADA_AP: "bg-orange-500/10 text-orange-500",
};

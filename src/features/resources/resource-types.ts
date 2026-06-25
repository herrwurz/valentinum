export const resourceTypes = ["ROOM", "VEHICLE", "EQUIPMENT"] as const;

export type ResourceTypeValue = (typeof resourceTypes)[number];

export interface ResourceInput {
  name: string;
  type: ResourceTypeValue;
  description?: string;
  location?: string;
  capacity?: number;
  areaSqm?: number;
  publicVisible: boolean;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

export interface ResourceDto extends ResourceInput {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const resourceTypeLabels: Record<ResourceTypeValue, string> = {
  ROOM: "Raum",
  VEHICLE: "Fahrzeug",
  EQUIPMENT: "Ausstattung",
};

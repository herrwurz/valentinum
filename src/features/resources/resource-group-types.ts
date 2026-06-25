export interface ResourceGroupDto {
  id: string;
  name: string;
  active: boolean;
  members: Array<{ id: string; name: string; type: string; active: boolean; publicVisible: boolean; capacity?: number }>;
}

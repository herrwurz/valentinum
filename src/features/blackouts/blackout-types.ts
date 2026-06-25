export interface BlackoutInput {
  resourceId: string;
  title: string;
  reason?: string;
  startAt: Date;
  endAt: Date;
}

export interface BlackoutDto extends BlackoutInput {
  id: string;
  resourceName: string;
  createdAt: Date;
}

export const initialResourceGroups = [
  {
    id: "initial-group-lounge-foyer",
    name: "Lounge + Foyer",
    resourceIds: ["initial-room-lounge", "initial-room-foyer"],
  },
  {
    id: "initial-group-foyer-saal",
    name: "Foyer + Großer Saal",
    resourceIds: ["initial-room-foyer", "initial-room-grosser-saal"],
  },
  {
    id: "initial-group-gesamt",
    name: "Gesamtes Valentinum",
    resourceIds: ["initial-room-lounge", "initial-room-foyer", "initial-room-grosser-saal"],
  },
] as const;

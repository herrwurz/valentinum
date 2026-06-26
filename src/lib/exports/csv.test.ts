import { describe, expect, it } from "vitest";

import { buildCsv, escapeCsvField } from "./csv";

const BOM = "﻿";

describe("escapeCsvField", () => {
  it("lässt einfache Werte unverändert", () => {
    expect(escapeCsvField("Großer Saal", ";")).toBe("Großer Saal");
  });
  it("umschließt Werte mit Trennzeichen", () => {
    expect(escapeCsvField("Lounge; Foyer", ";")).toBe('"Lounge; Foyer"');
  });
  it("verdoppelt Anführungszeichen", () => {
    expect(escapeCsvField('Saal "A"', ";")).toBe('"Saal ""A"""');
  });
  it("umschließt Werte mit Zeilenumbruch", () => {
    expect(escapeCsvField("Zeile1\nZeile2", ";")).toBe('"Zeile1\nZeile2"');
  });
});

describe("buildCsv", () => {
  it("erzeugt Kopf- und Datenzeilen mit BOM und CRLF", () => {
    const csv = buildCsv(["A", "B"], [["1", "2"], ["3", "4"]]);
    expect(csv).toBe(`${BOM}A;B\r\n1;2\r\n3;4`);
  });
  it("respektiert ein abweichendes Trennzeichen", () => {
    expect(buildCsv(["A", "B"], [["1", "2"]], { delimiter: ",", bom: false })).toBe("A,B\r\n1,2");
  });
});

import { TestBed } from "@angular/core/testing";
import { PivickAnalysis } from "./pivick-analysis";
import { HttpClient } from "@angular/common/http";
import { CubeClient } from "@cubejs-client/ngx";
import { Config } from "./config";
import { of, throwError } from "rxjs";
import { Cube, Meta, TCubeDimension, TCubeMeasure } from "@cubejs-client/core";

// Mock classes for dependencies
class MockHttpClient {}

class MockCubeClient {
  meta() {
    return of({
      cubes: [
        {
          name: "uk_price_paid_view",
          title: "UK Price Paid View",
          dimensions: [
            { name: "id", title: "ID", type: "string", shortTitle: "ID" },
            {
              name: "price",
              title: "Price",
              type: "number",
              shortTitle: "Price",
            },
          ],
          measures: [
            {
              name: "count",
              title: "Count",
              type: "number",
              shortTitle: "Count",
            },
          ],
        },
      ],
    } as unknown as Meta);
  }
}

class MockConfig {
  locale = "en";
}

describe("PivickAnalysis", () => {
  let service: PivickAnalysis;
  let cubeClient: MockCubeClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PivickAnalysis,
        { provide: HttpClient, useClass: MockHttpClient },
        { provide: CubeClient, useClass: MockCubeClient },
        { provide: Config, useClass: MockConfig },
      ],
    });
    service = TestBed.inject(PivickAnalysis);
    cubeClient = TestBed.inject(CubeClient) as MockCubeClient;
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("loadSchema", () => {
    it("should load the cube schema and update the cubeSchema$ observable", (done) => {
      service.loadSchema();
      service.cubeSchema$.subscribe((schema) => {
        if (schema) {
          expect(schema.name).toBe("uk_price_paid_view");
          expect(schema.dimensions.length).toBe(2);
          expect(schema.measures.length).toBe(1);
          done();
        }
      });
    });

    it("should handle errors when loading the schema", (done) => {
      spyOn(cubeClient, "meta").and.returnValue(
        throwError(() => new Error("Error loading schema")),
      );
      const consoleErrorSpy = spyOn(console, "error");

      service.loadSchema();

      service.cubeSchema$.subscribe({
        next: (schema) => {
          expect(schema).toBeNull();
        },
        error: () => {
          fail("Should not have errored");
        },
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      done();
    });
  });

  describe("row management", () => {
    it("should add a row", (done) => {
      service.addRow("price");
      service.selectedRows$.subscribe((rows) => {
        expect(rows).toEqual(["price"]);
        done();
      });
    });

    it("should not add a duplicate row", (done) => {
      service.addRow("price");
      service.addRow("price");
      service.selectedRows$.subscribe((rows) => {
        expect(rows).toEqual(["price"]);
        done();
      });
    });

    it("should remove a row", (done) => {
      service.addRow("price");
      service.removeRow("price");
      service.selectedRows$.subscribe((rows) => {
        expect(rows).toEqual([]);
        done();
      });
    });

    it("should clear all rows", (done) => {
      service.addRow("price");
      service.addRow("id");
      service.clearRows();
      service.selectedRows$.subscribe((rows) => {
        expect(rows).toEqual([]);
        done();
      });
    });
  });

  describe("column management", () => {
    it("should add a column", (done) => {
      service.addColumn("price");
      service.selectedColumns$.subscribe((cols) => {
        expect(cols).toEqual(["price"]);
        done();
      });
    });

    it("should not add a duplicate column", (done) => {
      service.addColumn("price");
      service.addColumn("price");
      service.selectedColumns$.subscribe((cols) => {
        expect(cols).toEqual(["price"]);
        done();
      });
    });

    it("should remove a column", (done) => {
      service.addColumn("price");
      service.removeColumn("price");
      service.selectedColumns$.subscribe((cols) => {
        expect(cols).toEqual([]);
        done();
      });
    });

    it("should clear all columns", (done) => {
      service.addColumn("price");
      service.addColumn("id");
      service.clearColumns();
      service.selectedColumns$.subscribe((cols) => {
        expect(cols).toEqual([]);
        done();
      });
    });
  });

  describe("measure management", () => {
    it("should add a measure", (done) => {
      service.addMeasure("count");
      service.selectedMeasures$.subscribe((measures) => {
        expect(measures).toEqual(["count"]);
        done();
      });
    });

    it("should not add a duplicate measure", (done) => {
      service.addMeasure("count");
      service.addMeasure("count");
      service.selectedMeasures$.subscribe((measures) => {
        expect(measures).toEqual(["count"]);
        done();
      });
    });

    it("should remove a measure", (done) => {
      service.addMeasure("count");
      service.removeMeasure("count");
      service.selectedMeasures$.subscribe((measures) => {
        expect(measures).toEqual([]);
        done();
      });
    });

    it("should clear all measures", (done) => {
      service.addMeasure("count");
      service.clearMeasures();
      service.selectedMeasures$.subscribe((measures) => {
        expect(measures).toEqual([]);
        done();
      });
    });
  });

  describe("getDimensionByName", () => {
    it("should return the correct dimension", (done) => {
      service.loadSchema();
      service.cubeSchema$.subscribe(() => {
        const dimension = service.getDimensionByName("price");
        expect(dimension).toBeDefined();
        expect(dimension?.name).toBe("price");
        done();
      });
    });

    it("should return undefined if schema is not loaded", () => {
      const dimension = service.getDimensionByName("price");
      expect(dimension).toBeUndefined();
    });
  });

  describe("getMeasureByName", () => {
    it("should return the correct measure", (done) => {
      service.loadSchema();
      service.cubeSchema$.subscribe(() => {
        const measure = service.getMeasureByName("count");
        expect(measure).toBeDefined();
        expect(measure?.name).toBe("count");
        done();
      });
    });

    it("should return undefined if schema is not loaded", () => {
      const measure = service.getMeasureByName("count");
      expect(measure).toBeUndefined();
    });
  });

  describe("getLabel", () => {
    it("should return the i18n label if it exists", () => {
      const member = {
        shortTitle: "Price",
        meta: { i18n: { en: "Price (EN)", de: "Preis" } },
      } as unknown as TCubeDimension;
      const label = service.getLabel(member);
      expect(label).toBe("Price (EN)");
    });

    it("should return the shortTitle if i18n label does not exist", () => {
      const member = {
        shortTitle: "Price",
        meta: {},
      } as unknown as TCubeDimension;
      const label = service.getLabel(member);
      expect(label).toBe("Price");
    });
  });
});

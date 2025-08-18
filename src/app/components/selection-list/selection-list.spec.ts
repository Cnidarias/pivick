import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SelectionList } from "./selection-list";
import { PivickAnalysis } from "../../services/pivick-analysis";
import { BehaviorSubject } from "rxjs";
import { TCubeDimension, TCubeMeasure } from "@cubejs-client/core";

class MockPivickAnalysis {
  selectedRows$ = new BehaviorSubject<string[]>([]);
  selectedColumns$ = new BehaviorSubject<string[]>([]);
  selectedMeasures$ = new BehaviorSubject<string[]>([]);

  getDimensionByName = (name: string) =>
    ({ name, shortTitle: name }) as TCubeDimension;
  getMeasureByName = (name: string) =>
    ({ name, shortTitle: name }) as TCubeMeasure;
  getLabel = (member: TCubeDimension | TCubeMeasure) => member.shortTitle;
}

describe("SelectionList", () => {
  let component: SelectionList;
  let fixture: ComponentFixture<SelectionList>;
  let pivickAnalysis: MockPivickAnalysis;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionList],
      providers: [{ provide: PivickAnalysis, useClass: MockPivickAnalysis }],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionList);
    component = fixture.componentInstance;
    pivickAnalysis = TestBed.inject(
      PivickAnalysis,
    ) as unknown as MockPivickAnalysis;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should update selectedRows when selectedRows$ emits", () => {
    pivickAnalysis.selectedRows$.next(["row1", "row2"]);
    fixture.detectChanges();
    expect(component.selectedRows.length).toBe(2);
    expect(component.selectedRows[0].name).toBe("row1");
  });

  it("should update selectedColumns when selectedColumns$ emits", () => {
    pivickAnalysis.selectedColumns$.next(["col1", "col2"]);
    fixture.detectChanges();
    expect(component.selectedColumns.length).toBe(2);
    expect(component.selectedColumns[0].name).toBe("col1");
  });

  it("should update selectedMeasures when selectedMeasures$ emits", () => {
    pivickAnalysis.selectedMeasures$.next(["measure1"]);
    fixture.detectChanges();
    expect(component.selectedMeasures.length).toBe(1);
    expect(component.selectedMeasures[0].name).toBe("measure1");
  });

  it("should get label for a dimension", () => {
    const label = component.getLabel({
      name: "test",
      shortTitle: "Test",
    } as TCubeDimension);
    expect(label).toBe("Test");
  });
});

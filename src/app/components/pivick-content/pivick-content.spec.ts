import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PivickContent } from "./pivick-content";

describe("PivickContent", () => {
  let component: PivickContent;
  let fixture: ComponentFixture<PivickContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PivickContent],
    }).compileComponents();

    fixture = TestBed.createComponent(PivickContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

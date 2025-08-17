import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DimensionList } from './dimension-list';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { TranslateService, TranslatePipe, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Config } from '../../services/config';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cube, TCubeDimension, TCubeMeasure } from '@cubejs-client/core';
import { TreeModule } from 'primeng/tree';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'dimensions.search': 'Search dimensions'
    });
  }
}

class MockPivickAnalysis {
  cubeSchema$ = new BehaviorSubject<Cube | null>(null);
  getDimensionByName = (name: string) => {
    if (name === 'price') {
        return { name: 'price', title: 'Price', shortTitle: 'Price', type: 'number' } as TCubeDimension;
    }
    return undefined;
  };
  getMeasureByName = (name: string) => undefined;
  getLabel = (member: TCubeDimension | TCubeMeasure) => member.shortTitle;
  addRow = jasmine.createSpy('addRow');
  addMeasure = jasmine.createSpy('addMeasure');
}

class MockConfig {
  locale$ = of('en');
}

describe('DimensionList', () => {
  let component: DimensionList;
  let fixture: ComponentFixture<DimensionList>;
  let pivickAnalysis: MockPivickAnalysis;

  const mockSchema: Cube = {
    name: 'test_cube',
    title: 'Test Cube',
    dimensions: [
        { name: 'price', title: 'Price', shortTitle: 'Price', type: 'number' } as TCubeDimension,
        { name: 'date', title: 'Date', shortTitle: 'Date', type: 'time' } as TCubeDimension
    ],
    measures: [
        { name: 'count', title: 'Count', shortTitle: 'Count', aggType: 'count' } as TCubeMeasure
    ],
    folders: [{
        name: 'Dimensions',
        members: ['price']
    }],
    segments: [],
    hierarchies: [],
    nestedFolders: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DimensionList,
        TreeModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeLoader
          }
        })
      ],
      providers: [
        { provide: PivickAnalysis, useClass: MockPivickAnalysis },
        { provide: Config, useClass: MockConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DimensionList);
    component = fixture.componentInstance;
    pivickAnalysis = TestBed.inject(PivickAnalysis) as unknown as MockPivickAnalysis;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build dimension tree when schema is loaded', () => {
    pivickAnalysis.cubeSchema$.next(mockSchema);
    fixture.detectChanges();

    expect(component.dimensionTree).toBeDefined();
    expect(component.dimensionTree?.length).toBeGreaterThan(0);
    // 1 folder + measures
    expect(component.dimensionTree?.length).toBe(2);
  });

  it('should clear dimension tree when schema is null', () => {
    pivickAnalysis.cubeSchema$.next(mockSchema);
    fixture.detectChanges();

    pivickAnalysis.cubeSchema$.next(null);
    fixture.detectChanges();

    expect(component.dimensionTree?.length).toBe(0);
  });

  it('should call addMeasure on node double click for a measure', () => {
    const mockMeasureNode = {
      node: {
        data: { name: 'count', aggType: 'count' } as TCubeMeasure,
      },
    };
    component.onNodeDoubleClickEvent(mockMeasureNode as any);
    expect(pivickAnalysis.addMeasure).toHaveBeenCalledWith('count');
  });

  it('should call addRow on node double click for a dimension', () => {
    const mockDimensionNode = {
      node: {
        data: { name: 'price', type: 'number' } as TCubeDimension,
      },
    };
    component.onNodeDoubleClickEvent(mockDimensionNode as any);
    expect(pivickAnalysis.addRow).toHaveBeenCalledWith('price');
  });
});

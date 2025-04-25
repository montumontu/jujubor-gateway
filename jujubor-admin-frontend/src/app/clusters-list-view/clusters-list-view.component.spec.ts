import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClustersListViewComponent } from './clusters-list-view.component';

describe('ClustersViewComponent', () => {
  let component: ClustersListViewComponent;
  let fixture: ComponentFixture<ClustersListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClustersListViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClustersListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

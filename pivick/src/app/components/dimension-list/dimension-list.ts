import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dimension, DimensionGroup, Measure, Pivick, PivickAnalysis } from '../../services/pivick-analysis';
import { Tree, TreeNodeDoubleClickEvent } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

@Component({
    selector: 'app-dimension-list',
    imports: [FormsModule, Tree],
    templateUrl: './dimension-list.html',
    styleUrl: './dimension-list.scss',
})
export class DimensionList implements AfterViewInit {
    pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

    dimensionTree?: TreeNode<Dimension | Measure>[];

    ngAfterViewInit(): void {
        this.pivickAnalysis.$pivickSchema.subscribe((data: Pivick | null) => {
            if (data) {
                const groups = [...new Set(data.dimensions.map((item) => item.group))].map((grp) => {
                    return { id: grp, name: data.dimensionGroups.find((v) => v.id === grp)?.name ?? '' };
                });

                this.dimensionTree = groups
                    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
                    .map((group, idx) => {
                        return {
                            key: `dim-${idx}}-${group.id}`,
                            label: group.name,
                            icon: '',
                            expanded: true,
                            children: data.dimensions
                                .filter((dim) => dim.group == group.id)
                                .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
                                .map((dim, inneridx) => {
                                    return {
                                        key: `dim-${idx}}-${group.id}-${inneridx}-${dim.name}`,
                                        label: dim.name,
                                        data: dim,
                                        icon: 'pi pi-database',
                                        draggable: true,
                                    };
                                }),
                        };
                    });
            }

            this.dimensionTree?.push({
                key: 'measures',
                label: 'Measures',
                expanded: true,
                children: data?.measures
                    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
                    .map((measure, idx) => {
                        return {
                            key: `measure-${idx}`,
                            label: measure.name,
                            data: measure,
                            icon: 'pi pi-wave-pulse',
                        };
                    }),
            });
        });
    }

    onNodeDoubleClickEvent($e: TreeNodeDoubleClickEvent) {
        console.log($e);
    }
}

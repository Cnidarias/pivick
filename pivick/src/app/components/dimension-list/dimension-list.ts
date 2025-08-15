import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { Tree, TreeNodeDoubleClickEvent } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { Cube, TCubeDimension, TCubeFolder, TCubeMeasure } from '@cubejs-client/core';

@Component({
    selector: 'app-dimension-list',
    imports: [FormsModule, Tree],
    templateUrl: './dimension-list.html',
    styleUrl: './dimension-list.scss',
})
export class DimensionList implements AfterViewInit {
    pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

    private schema?: Cube;

    dimensionTree?: TreeNode<TCubeFolder | TCubeDimension | TCubeMeasure>[];

    ngAfterViewInit(): void {
        this.pivickAnalysis.cubeSchema$.subscribe((schema) => {
            if (!schema) {
                this.dimensionTree = [];
                return;
            }

            this.schema = schema;

            this.dimensionTree = schema.folders
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((folder) => {
                    return {
                        label: folder.name,
                        data: folder,
                        key: folder.name,
                        expanded: true,
                        children: folder.members
                            .map((memberName: string) => this.getDimensionByFolderMemberName(memberName))
                            .filter((member) => member !== undefined)
                            .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle))
                            .map((member: TCubeDimension) => {
                                if (member.type === 'time') {
                                    return this.makeTimeDimensionEntries(member);
                                }
                                return {
                                    label: member.shortTitle,
                                    data: member,
                                    key: member.name,
                                    icon: 'pi pi-database',
                                };
                            })
                            .flat(),
                    };
                });
            this.dimensionTree?.push({
                key: 'measures',
                label: 'Measures',
                expanded: true,
                children: schema.measures
                    .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle))
                    .map((measure: TCubeMeasure) => {
                        return {
                            label: measure.shortTitle,
                            data: measure,
                            key: measure.name,
                            icon: 'pi pi-wave-pulse',
                        };
                    }),
            });
        });
    }

    getDimensionByFolderMemberName(memberName: string): TCubeDimension | undefined {
        if (!this.schema) {
            return undefined;
        }
        return this.schema.dimensions.find((dimension) => {
            return dimension.name === memberName;
        });
    }

    makeTimeDimensionEntries(dimension: TCubeDimension): TreeNode<TCubeDimension>[] {
        return ['Full Date', 'Year', 'Quarter', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'].map(
            (timePart: string) => {
                return {
                    label: `${dimension.shortTitle} (${timePart})`,
                    data: {
                        ...dimension,
                        timeDimension: {
                            dateGranularity: timePart.toLowerCase(),
                        },
                    },
                    key: `${dimension.name}_${timePart}`,
                    icon: 'pi pi-calendar',
                };
            }
        );
    }

    onNodeDoubleClickEvent($e: TreeNodeDoubleClickEvent) {
        console.log($e);
    }
}

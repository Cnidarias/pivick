import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { Tree, TreeNodeDoubleClickEvent } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { Cube, TCubeDimension, TCubeFolder, TCubeMeasure } from '@cubejs-client/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Config } from '../../services/config';
import { config } from 'rxjs';

@Component({
    selector: 'app-dimension-list',
    imports: [FormsModule, Tree, TranslatePipe],
    templateUrl: './dimension-list.html',
    styleUrl: './dimension-list.scss',
})
export class DimensionList implements AfterViewInit {
    private translate: TranslateService = inject(TranslateService);
    private config: Config = inject(Config);
    private pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

    private schema?: Cube;

    dimensionTree?: TreeNode<TCubeFolder | TCubeDimension | TCubeMeasure>[];

    ngAfterViewInit(): void {
        this.pivickAnalysis.cubeSchema$.subscribe((schema) => {
            if (!schema) {
                this.dimensionTree = [];
                return;
            }

            this.schema = schema;
            this.resetDimensionTree();
        });

        this.config.locale$.subscribe((locale) => {
            this.resetDimensionTree();
        });
    }

    resetDimensionTree() {
        this.dimensionTree = [];
        if (!this.schema) {
            return;
        }
        console.log('Locale for tree:' + this.config.locale);
        this.dimensionTree = this.schema.folders
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
                                label: this.getLabel(member),
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
            children: this.schema.measures
                .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle))
                .map((measure: TCubeMeasure) => {
                    return {
                        label: this.getLabel(measure),
                        data: measure,
                        key: measure.name,
                        icon: 'pi pi-wave-pulse',
                    };
                }),
        });
    }

    getLabel(member: TCubeDimension | TCubeMeasure): string {
        console.log(member.meta, member.meta.i18n);
        if (member.meta?.i18n && member.meta.i18n[this.config.locale]) {
            return member.meta.i18n[this.config.locale];
        }
        return member.shortTitle;
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
        return [
            'date.full',
            'date.year',
            'date.quarter',
            'date.month',
            'date.week',
            'date.day',
            'date.hour',
            'date.minute',
            'date.second',
        ].map((timePart: string) => {
            const timePartLabel = this.translate.instant(timePart);
            return {
                label: `${this.getLabel(dimension)} (${timePartLabel})`,
                data: {
                    ...dimension,
                    timeDimension: {
                        dateGranularity: timePart.toLowerCase(),
                    },
                },
                key: `${dimension.name}_${timePart}`,
                icon: 'pi pi-calendar',
            };
        });
    }

    onNodeDoubleClickEvent($e: TreeNodeDoubleClickEvent) {
        console.log($e);
    }
}

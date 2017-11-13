import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';

import * as d3 from 'd3';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Format from 'd3-format';
import * as d3Sankey from 'd3-sankey';
import * as d3Request from 'd3-request';
import {environment} from '../../environments/environment';

import {OptionsPanelComponent} from '../options-panel/options-panel.component';

@Component({
    selector: 'app-d3-playground',
    templateUrl: './d3-playground.component.html',
    styleUrls: ['./d3-playground.component.css']
})
export class D3PlaygroundComponent implements OnInit {

    private width: number;
    private height: number;
    private svg: any;
    private sankey: any;
    private optionsPanel: OptionsPanelComponent;

    // @ViewChild('sankey') elementView;

    constructor() {
        this.width = window.innerWidth * 0.8;
        this.height = 500;
    }

    ngOnInit() {
        this.svg = d3Selection.select('#sankey');
        this.svg.call(d3.zoom().scaleExtent([1, 10]).on('zoom', () => {
            this.svg.attr(
                'transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')scale(' + d3.event.transform.k + ')'
            );
        }));

        this.sankey = d3Sankey.sankey()
            .nodeWidth(10)
            .nodePadding(10)
            .extent([[1, 1], [this.width - 1, this.height - 6]]);

        this.optionsPanel = new OptionsPanelComponent();

        this.switchView(0);
        this.clearSankey();

    }

    /**
     * switches between commit and file view
     * @param {number} paraView specifies the view is currently used
     */
    public switchView(paraView: number): void {
        this.clearSankey();
        this.drawSankey(environment.dataHost + 'mock_data/' + paraView);
    }

    /**
     * clears the diagram area
     */
    private clearSankey(): void {
        if (this.svg != null) {
            this.svg.html('');
        }
    }

    /**
     * sets up the layout for a link in the sankey diagram and appends it to the svg
     * @returns {any} the link created in the svg
     */
    private initLinkLayout() {
        const link = this.svg.append('g')
            .attr('class', 'links')
            .attr('fill', 'none')
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.2)
            .selectAll('path');

        return link;
    }

    /**
     * sets up the layout for a node in the sankey diagram and appends it to the svg
     * @returns {any} the node created in the svg
     */
    private initNodeLayout() {
        const node = this.svg.append('g')
            .attr('class', 'nodes')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .selectAll('g');

        return node;
    }

    /**
     * creates all links based on the passed links
     * @param paraLinks the links as json objects in an array
     * @returns {any} all created links in the svg
     */
    private createLinks(paraLinks: any): any {
        return this.initLinkLayout()
            .data(paraLinks)
            .enter().append('path')
            .attr('d', d3Sankey.sankeyLinkHorizontal())
            .attr('stroke-width', function (d) {
                return Math.max(1, d.width);
            })
            .attr('stroke', function (d) {

                // TODO: besser machen, weil ja nur einer der beiden switches überhaupt ausgeführt wird
                switch (d.fileName) {
                    case 'file_1':
                        return 'red';
                    case 'file_2':
                        return 'green';
                    case 'file_3':
                        return 'yellow';
                    case 'file_4':
                        return 'blue';
                    case 'file_5':
                        return 'pink';
                    case 'file_6':
                        return 'darkgreen';
                }
                switch (d.changeType) {
                    case 'added':
                        return 'green';
                    case 'modified':
                        return 'yellow';
                    case 'deleted':
                        return 'red';
                }
            })
            .sort((a, b) => {
                return b.y1 - a.y1;
            });
        /*.append('title')
        .text(function (d) {
            return d.source.name + ' → ' + d.target.name;
        });*/
    }

    /**
     * creates all nodes based on the passed nodes
     * @param paraNodes nodes as json objects in an array
     * @returns {any} all created nodes in the svg
     */
    private createNodes(paraNodes: any): any {
        return this.initNodeLayout()
            .data(paraNodes)
            .enter().append('g');
    }

    /**
     * draws the sankey diagram based on the returned json data from the given path
     * @param {string} paraPath
     */
    private drawSankey(paraPath: string) {

        const formatNumber = d3Format.format(',.0f'),
            format = function (d) {
                return formatNumber(d) + ' TWh';
            },
            color = d3Scale.scaleOrdinal(d3Scale.schemeCategory10);

        d3Request.json(paraPath, (error, graph) => {
            if (error) {
                throw error;
            }

            this.sankey(graph);
            this.createLinks(graph.links);

            const nodes = this.createNodes(graph.nodes);

            nodes.append('rect')
                .attr('x', function (d) {
                    return d.x0;
                })
                .attr('y', (d) => {
                    //console.log( this.height - (this.height * d.quality) );
                    //return this.height - (this.height * d.quality);
                    return d.y0;
                })
                .attr('height', function (d) {
                    return d.y1 - d.y0;
                })
                .attr('width', function (d) {
                    return d.x1 - d.x0;
                })
                .attr('fill', function (d) {
                    return color(d.name.replace(/ .*/, ''));
                })
                .attr('stroke', '#000');

            nodes.append('text')
                .attr('x', function (d) {
                    return d.x0 - 6;
                })
                .attr('y', function (d) {
                    return (d.y1 + d.y0) / 2;
                })
                .attr('dy', '0.35em')
                .attr('text-anchor', 'end')
                .text(function (d) {
                    return d.name;
                })
                .filter(function (d) {
                    return d.x0 < this.width / 2;
                })
                .attr('x', function (d) {
                    return d.x1 + 6;
                })
                .attr('text-anchor', 'start');

            nodes.append('title')
                .text(function (d) {
                    return d.name + '\n' + format(d.value);
                });
        });
    }

}

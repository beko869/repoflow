import {Component, OnInit} from '@angular/core';
import {OptionsPanelComponent} from "../options-panel/options-panel.component";

import * as d3 from 'd3';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Shape from 'd3-shape';
import * as d3Request from 'd3-request';
import {environment} from "../../environments/environment";
import {UtilityService} from '../shared/UtilityService';

@Component({
    selector: 'app-trend-chart',
    templateUrl: './trend-chart.component.html',
    styleUrls: ['./trend-chart.component.css'],
    providers: [UtilityService]
})

export class TrendChartComponent implements OnInit {

    private width: number;
    private height: number;
    private margin: any;
    private yScale: any;
    private xScale: any;
    private yAxis: any;
    private xAxis: any;
    private trendVisualizationWrapper: any;
    private optionsPanel: OptionsPanelComponent;

    constructor( private utility: UtilityService ) {
        this.margin = {top:20, right:100, bottom:60, left:30};

        this.width = window.innerWidth * 0.8 - this.margin.left - this.margin.right;
        this.height = window.innerHeight * 0.9 - this.margin.top - this.margin.bottom;
    }

    ngOnInit() {
        d3Request.json(environment.dataHost + 'mock_data/0', (error, data) => {
            this.initSvg();
            this.initScales( data["commit-nodes"] );
            this.initAxis();

            this.renderAxis();
        });

        this.doCommitViewRequestAndRender();
    }

    public doCommitViewRequestAndRender() {
        this.clearFileView();

        d3Request.json(environment.dataHost + 'mock_data/0', (error, data) => {
            this.renderCommitView( data );
        });
    }

    public doFileViewRequestAndRender() {
        this.clearCommitView();

        d3Request.json(environment.dataHost + 'mock_data/1', (error, data) => {
            this.renderFileView( data );
        });
    }

    public renderCommitView( paraData: any ): void {
        this.renderCommitViewNodes( paraData["commit-nodes"] );
        this.renderCommitViewFileLinks( paraData["commit-nodes"], paraData["file-links"] )
    }

    public renderFileView( paraData: any ): void {
        this.renderFileViewNodes( paraData["commit-nodes"] );
        this.renderFileViewFileLinks( paraData["commit-nodes"], paraData["file-links"] )
    }

    public clearCommitView(): void {
        d3Selection.selectAll('.commit-view-node').remove();
        d3Selection.selectAll('.commit-view-link').remove();
    }

    public clearFileView(): void {
        d3Selection.selectAll('.file-view-node').remove();
        d3Selection.selectAll('.file-view-link').remove();
    }



    /**
     * initializes an svg element in the div area of the visualization
     */
    public initSvg(): void {
        //select div where svg will be rendered in
        this.trendVisualizationWrapper = d3Selection.select('#trend-chart')
            .append("svg")
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform","translate("+this.margin.left+","+this.margin.top + ")");
    }

    /**
     * initializes the scales for this visualization
     * yScale: a 1 to 100 percent based scale
     * xScale: a time based scale
     */
    public initScales( paraCommitNodesData: any ): void {
        //define y scale from 1 to 100 (percent representation for quality)
        this.yScale = d3Scale.scaleLinear()
            .domain([0, 100])
            .range([this.height, 0]);

        //define x scale as time scale and map it to min and max date from repository data
        this.xScale = d3Scale.scaleTime()
            .domain( d3Array.extent( paraCommitNodesData, function( d ){ return new Date(d.datetime) }) )
            .range([0, this.width]);
    }

    /**
     * initializes the x and y axis with the corresponding scales
     */
    public initAxis(): void {
        //set axis with defined scales
        this.yAxis = d3Axis.axisRight(this.yScale);
        this.xAxis = d3Axis.axisBottom(this.xScale).tickFormat(d3TimeFormat.timeFormat("%Y-%m-%dT%H:%M:%S"));
    }

    /**
     * renders the axis with the initialized values to the svg
     */
    public renderAxis(): void {
        this.trendVisualizationWrapper.append("g")
            .attr("class","yaxis")
            .call(this.yAxis);

        this.trendVisualizationWrapper.append("g")
            .attr("class","xaxis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("transform","rotate(-65)");
    }

    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderCommitViewNodes( paraCommitNodesData: any ): void {
        this.trendVisualizationWrapper.append('g').selectAll('rect')
        .data(paraCommitNodesData)
        .enter()
        .append('rect')
        .attr('class','commit-view-node')
        .attr('x', (d)=>{ return this.xScale( new Date(d.datetime) ) })
        .attr('y', (d)=>{ return this.yScale( d.quality*100 ) })
        .attr('width', 10)
        .attr('height', 50)
        .attr('fill', 'teal')
        .attr('width', 10)
        .attr('height', (d)=>{ return d.quality2*150 })
        .attr('fill', 'teal')
            .attr('transform', (d)=>{ return 'translate(0,-' + (d.quality2*150/2) + ')' });
    }

    /**
     * renders links based on the files paths through commits
     * @param paraCommitNodesData commit data as array from the backend
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderCommitViewFileLinks( paraCommitNodesData: any, paraFileLinksData: any ): void {

        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return d[ 'x' ] })
            .y((d)=>{ return d[ 'y' ] });

        let controlFileLinkRenderHeightArray = [];


        //iterating through every set of filepaths
        paraFileLinksData.forEach( (filePath,i)=>{
            let fileLinkArray = [];

            //iterating through every commit the file passed and retrieving scaled x and y coordinates
            filePath.links.forEach( (fileLink)=>{

                controlFileLinkRenderHeightArray.push(fileLink.commitId);

                fileLinkArray.push(
                    {
                        "x": this.xScale( new Date(paraCommitNodesData[fileLink.commitId].datetime) ),
                        "y": this.yScale( paraCommitNodesData[fileLink.commitId].quality * 100 - this.utility.getCounterForValueInArray( fileLink.commitId, controlFileLinkRenderHeightArray ) )
                    }
                );

            } );

            this.trendVisualizationWrapper
                .append('path')
                .datum(fileLinkArray)
                .attr('class','commit-view-link')
                .attr("fill", "none")
                .attr("stroke", filePath.color)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        } );
    }

    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderFileViewNodes( paraCommitNodesData: any ): void {
        this.trendVisualizationWrapper.append('g').selectAll('rect')
            .data(paraCommitNodesData)
            .enter()
            .append('rect')
            .attr('class','file-view-node')
            .attr('x', (d)=>{ return this.xScale( new Date(d.datetime) ) })
            .attr('y', (d)=>{ return this.yScale( d.quality*100 ) })
            .attr('width', 10)
            .attr('height', 50)
            .attr('fill', 'teal')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', 'teal')
            .attr('transform', 'translate(0,-5)');
    }

    /**
     * renders links based on the files paths through commits
     * @param paraCommitNodesData commit data as array from the backend
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderFileViewFileLinks( paraCommitNodesData: any, paraFileLinksData: any ): void {

        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return d[ 'x' ] })
            .y((d)=>{ return d[ 'y' ] });

        //iterating through every set of filepaths
        paraFileLinksData.forEach( (filePath,i)=>{
            let fileLinkArray = [];

            //iterating through every commit the file passed and retrieving scaled x and y coordinates
            filePath.links.forEach( (fileLink)=>{

                fileLinkArray.push(
                    {
                        "x": this.xScale( new Date(paraCommitNodesData[fileLink.commitId].datetime) ),
                        "y": this.yScale( paraCommitNodesData[fileLink.commitId].quality * 100 )
                    }
                );

            } );

            this.trendVisualizationWrapper
                .append('path')
                .datum(fileLinkArray)
                .attr('class','file-view-link')
                .attr("fill", "none")
                .attr("stroke", filePath.color)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        } );
    }

    /**
     * switches between commit and file view
     * @param {number} paraView specifies the view is currently used
     */
    public switchView(paraView: number): void {

        if( paraView == 0 ){
            this.doCommitViewRequestAndRender();
        }
        else {
            this.doFileViewRequestAndRender();
        }

        return;
    }




}

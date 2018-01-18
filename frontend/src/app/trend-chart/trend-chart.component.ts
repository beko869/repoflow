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
    private tooltip: any;
    private optionsPanel: OptionsPanelComponent;

    constructor( private utility: UtilityService ) {
        this.margin = {top:20, right:100, bottom:60, left:30};

        this.width = window.innerWidth * 0.8 - this.margin.left - this.margin.right;
        this.height = window.innerHeight * 0.9 - this.margin.top - this.margin.bottom;
    }

    ngOnInit() {
        d3Request.json(environment.dataHost + 'read/commit_data', (error, data) => {
            this.initSvg();
            this.initScales( data["commit-nodes"] );
            this.initAxis();
            this.initTooltip();

            this.renderAxis();
        });

        this.doCommitViewRequestAndRender();
    }

    public doCommitViewRequestAndRender() {
        this.clearFileView();

        d3Request.json(environment.dataHost + 'read/commit_data', (error, data) => {
            this.renderCommitView( data );
        });
    }

    public doFileViewRequestAndRender( paraFilePath: string ) {
        this.clearCommitView();

        d3Request.json(environment.dataHost + 'read/file_data/'+encodeURIComponent( paraFilePath ), (error, data) => {
            this.renderFileView( data );
        });
    }

    public renderCommitView( paraData: any, paraMetricArray: any = [1] ): void {
        this.renderCommitViewNodes( paraData["commit-nodes"] );
        this.renderCommitViewLinks( paraData["commit-nodes"] );
        //this.renderCommitViewFileLinks( paraData["commit-nodes"], paraData["file-links"] )
    }

    public renderFileView( paraData: any ): void {
        this.renderFileViewNodes( paraData["files"] );
        this.renderFileViewFileLinks( paraData["files"] )
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
            .range( [this.height, 0] );

        //define x scale as time scale and map it to min and max date from repository data
        this.xScale = d3Scale.scaleTime()
            .domain( d3Array.extent( paraCommitNodesData, function( d ){ return new Date(d.datetime) }) )
            .range( [0, this.width] );
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
     * initializes a transparent div element with class tooltip
     */
    public initTooltip(): void {
        //set Tooltip
        this.tooltip = d3Selection.select("#trend-chart").append("div")
            .attr("class","tooltip")
            .style("opacity",0)
    }

    /**
     * fades the tooltip html in at the left corner of the visualization
     * @param paraTooltipContent the content to be displayed in the tooltip
     */
    public fadeInTooltip( paraTooltipContent: any ): void {
        this.tooltip.transition().duration(200).style("opacity",0.9);
        this.tooltip.html( paraTooltipContent ).style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    /**
     * fades out the tooltip html
     */
    public fadeOutTooltip(): void {
        this.tooltip.transition().duration(500).style("opacity",0);
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
    public renderCommitViewNodes( paraCommitNodesData: any, paraQualityMetric: any = 1 ): void {

        this.trendVisualizationWrapper.append('g').selectAll('rect')
        .data(paraCommitNodesData)
        .enter()
        .append('circle')
        .attr('class','commit-view-node')
        .attr('cx', (d)=>{ return this.xScale( new Date(d.datetime) ) })
        .attr('cy', (d)=>{ return this.yScale( d.quality_metric_1*100 ) })
        //.attr('width', 10)
        //.attr('height', 50)
        .attr('fill', 'teal')
        //.attr('width', 10)
        .attr('r', (d)=>{ return d.fileCount*3 })
        .attr('fill', 'teal')
            .on("mouseover", (d) => {
                console.log(d.id);
                this.fadeInTooltip( d.id );
            })
            .on("mouseout",(d)=>{
                this.fadeOutTooltip();
            });
    }

    /**
     * renders links based on the order of commits
     * @param paraCommitNodesData commit data as array from the backend
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderCommitViewLinks( paraCommitNodesData: any ): void {
        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return d[ 'x' ] })
            .y((d)=>{ return d[ 'y' ] })
            .curve(d3Shape.curveMonotoneX);


        let commitLinkArray = [];
        let dateCompare = this.utility.commitDatetimeComparer;
        let commitNodesSortedByDatetime = paraCommitNodesData.sort( dateCompare );

        commitNodesSortedByDatetime.forEach( (commitNode,i)=>{
            commitLinkArray.push({
                "x": this.xScale( new Date(commitNode.datetime) ),
                "y": this.yScale( commitNode.quality_metric_1*100 )
            });
        });

        this.trendVisualizationWrapper
            .append('path')
            .datum(commitLinkArray)
            .attr('class','commit-view-link')
            .attr("fill", "none")
            .attr("stroke", 'red')
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);

    }


    /**
     * renders links based on the files paths through commits
     * @param paraCommitNodesData commit data as array from the backend
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderCommitViewFileLinks( paraCommitNodesData: any, paraFileLinksData: any ): void {
        //TODO currently deprecated as it makes little sense in commits with a huge file count to display them all as a link
        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return d[ 'x' ] })
            .y((d)=>{ return d[ 'y' ] });

        let controlFileLinkRenderHeightArray = [];

        console.log("fileLinksData",paraFileLinksData);

        //iterating through every set of filepaths
        paraFileLinksData.forEach( (filePath,i)=>{
            for( let i=0; i<filePath.links.length-1; i++ ){

                let fileLinkArray = [];
                controlFileLinkRenderHeightArray.push(filePath.links[i].commitId);

                let lookup = this.utility.createIDLookupForArray( paraCommitNodesData );


                fileLinkArray.push(
                    {
                        "x": this.xScale( new Date(lookup[filePath.links[i].commitId].datetime) ),
                        "y": this.yScale( lookup[filePath.links[i].commitId].quality * 100 - this.utility.getCounterForValueInArray( filePath.links[i].commitId, controlFileLinkRenderHeightArray ) ),
                        "commitId": filePath.links[i].commitId,
                        "fileName": filePath.links[i].name
                    }
                );

                fileLinkArray.push(
                    {
                        "x": this.xScale( new Date(lookup[filePath.links[i+1].commitId].datetime) ),
                        "y": this.yScale( lookup[filePath.links[i+1].commitId].quality * 100 - this.utility.getCounterForValueInArray( filePath.links[i+1].commitId, controlFileLinkRenderHeightArray ) ),
                        "commitId": filePath.links[i+1].commitId,
                        "fileName": filePath.links[i+1].name
                    }
                );

                console.log("fileLinksArray",fileLinkArray);

                this.trendVisualizationWrapper
                    .append('path')
                    .datum(fileLinkArray)
                    .attr('class','commit-view-link')
                    .attr("fill", "none")
                    .attr("stroke", filePath.color)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 3)
                    .attr("d", line)
                    .on("mouseover", (d) => {

                        console.log(d[0].fileName + " goes from " + d[0].commitId.substring(0,7) + " to " + d[1].commitId.substring(0,7));
                        this.fadeInTooltip( d[0].fileName + " goes from " + d[0].commitId.substring(0,7) + " to " + d[1].commitId.substring(0,7));
                    })
                    .on("mouseout",(d)=>{
                        this.fadeOutTooltip();
                    });

                fileLinkArray = [];

            }
        } );
    }

    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderFileViewNodes( paraFileNodesData: any ): void {

        console.log(paraFileNodesData);

        this.trendVisualizationWrapper.append('g').selectAll('rect')
            .data(paraFileNodesData)
            .enter()
            .append('rect')
            .attr('class','file-view-node')
            .attr('x', (d)=>{ return this.xScale( new Date(d.c.datetime) ) })
            .attr('y', (d)=>{ return this.yScale( d.f.quality_metric_1*100 ) })
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
    public renderFileViewFileLinks( paraFileLinksData: any ): void {
        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return d[ 'x' ] })
            .y((d)=>{ return d[ 'y' ] })
            .curve(d3Shape.curveMonotoneX);

        let fileLinkArray = [];
        let dateCompare = this.utility.fileDatetimeComparer;
        let filesSortyByCommitDatetime = paraFileLinksData.sort( dateCompare );

        filesSortyByCommitDatetime.forEach( (file,i)=>{
            fileLinkArray.push({
                "x": this.xScale( new Date(file.c.datetime) ),
                "y": this.yScale( file.f.quality_metric_1*100 )
            });
        });

        this.trendVisualizationWrapper
            .append('path')
            .datum(fileLinkArray)
            .attr('class','file-view-link')
            .attr("fill", "none")
            .attr("stroke", 'red')
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);
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
            this.doFileViewRequestAndRender('');
        }

        return;
    }

    /**
     * filters for a specific file and displays the file quality metric view
     * @param {string} paraFilepath specifies the file data to be displayed
     */
    public filterForFile( paraFilepath:string = '' ): void {

        if( paraFilepath == '' ){
            this.doCommitViewRequestAndRender();
        }
        else {
            this.doFileViewRequestAndRender( paraFilepath );
        }

        return;
    }




}

import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import * as d3 from 'd3';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Shape from 'd3-shape';
import * as d3Request from 'd3-request';
import * as d3Zoom from 'd3-zoom';
import * as moment from 'moment';
import {environment} from "../../environments/environment";
import {UtilityService} from '../shared/UtilityService';
import {OptionsPanelValueService} from "../shared/OptionsPanelValueService";
import 'codemirror/mode/javascript/javascript';
import 'codemirror';


@Component({
    selector: 'app-trend-chart',
    templateUrl: './trend-chart.component.html',
    styleUrls: ['./trend-chart.component.css'],
    providers: [UtilityService],
    encapsulation: ViewEncapsulation.None
})

export class TrendChartComponent implements OnInit {

    private width: number;
    private height: number;
    private margin: any;
    private yScale: any;
    private xScale: any;
    private yAxis: any;
    private xAxis: any;
    private renderedXAxis: any;
    private renderedYAxis: any;
    private xScaleZoomed: any;
    private trendVisualizationWrapper: any;
    private tooltip: any;
    private fileColorLookupArray: any;
    private isFileDetailViewVisible: boolean;
    private codeMirrorConfig;

    @ViewChild('optionsPanel') optionsPanel;
    @ViewChild('codeMirrorInstance') codeMirrorInstance;4

    constructor( private utility: UtilityService, private optionsPanelValueService: OptionsPanelValueService ) {

        this.isFileDetailViewVisible = false;
        this.codeMirrorConfig = {lineNumbers: true, mode: 'javascript'};

        this.margin = {top:20, right:100, bottom:60, left:30};

        this.width = window.innerWidth * 0.8 - this.margin.left - this.margin.right;
        this.height = window.innerHeight * 0.6 - this.margin.top - this.margin.bottom;

        this.xScaleZoomed = null;
    }

    ngOnInit() {
        d3Request.json(environment.dataHost + 'read/initial_data', (error, data) => {
            this.fileColorLookupArray = this.utility.createFileNameColorLookupForArray( data["file-colors"] );

            this.initTooltip();
            this.initScales( data["commit-nodes"] );
            this.initAxis();
            this.initSvg();
            this.renderAxis();
            this.initOptionsPanel( data["file-names"], this.fileColorLookupArray );

        })
    }

    /**
     * requests commit data and renders the basic commit view
     */
    public doCommitViewRequestAndRender( paraQuality:string ) {
        this.fadeFileViewToBackground();
        this.fadeCommitViewToForeGround();

        d3Request.json(environment.dataHost + 'read/commit_data', (error, data) => {
            this.renderCommitView( data, paraQuality );
        });
    }


    /**
     * requests file data and renders the basic commit view
     */
    public doFileViewRequestAndRender( paraFilePath: string ) {
        this.fadeCommitViewToBackground();
        this.fadeFileViewToForeground();

        d3Request.json(environment.dataHost + 'read/file_data/'+encodeURIComponent( paraFilePath ), (error, data) => {
            this.renderFileView( data );
        });
    }


    /**
     * renders the commit view with the given data array
     * @param paraData array containing commit nodes data
     * @param paraCommitQuality string determining which commit quality gets rendered
     */
    public renderCommitView( paraData: any, paraCommitQuality: string ): void {
        this.renderCommitViewNodes( paraData["commit-nodes"], paraCommitQuality );
        //this.renderCommitViewLinks( paraData["commit-nodes"], paraCommitQuality );
        this.renderCommitViewBalloonLines( paraData["commit-nodes"], paraCommitQuality );
    }


    /**
     * renders the file view with the given data array
     * @param paraData array containing files data
     */
    public renderFileView( paraData: any ): void {
        this.renderFileViewNodes( paraData["files"] );
        this.renderFileViewFileLinks( paraData["files"] )
    }


    /**
     * clears the view from all elements containing commit classes
     */
    public clearCommitView( paraCommitQuality:string = null ): void {
        this.clearFileDetailView();
        this.fadeFileViewToForeground();

        if( paraCommitQuality === null ){
            d3Selection.selectAll('.commit-view-node').remove();
            d3Selection.selectAll('.commit-view-link').remove();
            d3Selection.selectAll('.commit-view-balloon-line').remove();
        }
        else {
            d3Selection.selectAll('.commit-view-node.' + paraCommitQuality ).remove();
            d3Selection.selectAll('.commit-view-link.' + paraCommitQuality ).remove();
            d3Selection.selectAll('.commit-view-balloon-line.' + paraCommitQuality ).remove();
        }
    }


    /**
     * clears the view from all elements containing file classes
     */
    public clearFileView( paraFileName:string = null ): void {
        this.clearFileDetailView();
        this.fadeCommitViewToForeGround();

        if( paraFileName === null ) {
            d3Selection.selectAll('.file-view-node').remove();
            d3Selection.selectAll('.file-view-link').remove();
        }
        else {
            d3Selection.selectAll('.file-view-node.' + paraFileName.split("/").join("").split(".").join("")).remove();
            d3Selection.selectAll('.file-view-link.' + paraFileName.split("/").join("").split(".").join("")).remove();
        }
    }


    /**
     * resets the trendVisualizationWrapper to visible
     */
    public clearFileDetailView(): void {
        //this.isFileDetailViewVisible = false;
        //this.trendVisualizationWrapper.attr("display","inline");
    }

    public showFileDetailView( paraCodeMirrorContent = "" ): void {

        let doc = this.codeMirrorInstance.instance.getDoc();
        doc.setValue( paraCodeMirrorContent );
        doc.addLineClass( 5, "wrap", "goodLine")
        doc.addLineClass( 6, "wrap", "notSureLine")
        doc.addLineClass( 7, "wrap", "badLine")
        doc.addLineClass( 10, "wrap", "badLine")
        doc.addLineClass( 11, "wrap", "badLine")
        doc.addLineClass( 13, "wrap", "goodLine")

    }

    /*public getFileDetailViewVisible(): boolean {
        return this.isFileDetailViewVisible;
    }*/


    /**
     * initializes an svg element in the div area of the visualization
     * sets zoom functions to x-axis
     */
    public initSvg(): void {
        //select div where svg will be rendered in
        this.trendVisualizationWrapper = d3Selection.select('#trend-chart')
            .append("svg")
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .attr("transform","translate(0,"+this.margin.top + ")");

        //.append("g")
            //.attr("transform","translate(0,"+this.margin.top + ")");

        this.trendVisualizationWrapper
            .append("defs")
            .append("clipPath")
            .attr("id", "clipper")
            .append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width",this.width)
            .attr("height",this.height);

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
     * returns the current xscale based on zoom level (if not zoomed, returns default xscale)
     */
    public getCurrentXScale(): any {
        return ( this.xScaleZoomed == null ? this.xScale : this.xScaleZoomed );
    }

    /**
     * initializes the x and y axis with the corresponding scales
     */
    public initAxis(): void {
        //set axis with defined scales
        this.yAxis = d3Axis.axisRight(this.yScale);
        this.xAxis = d3Axis.axisBottom(this.xScale).tickFormat(d3TimeFormat.timeFormat("%d.%m.%Y"));
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
     * initialize the options panel
     */
    public initOptionsPanel( paraFileNamesArray: string[], paraFileColorsArray: any ): void {
        this.optionsPanel.setFileList( paraFileNamesArray );
        this.optionsPanel.setFileColorList( paraFileColorsArray );
    }


    /**
     * fades the tooltip html in at the left corner of the visualization
     * @param paraTooltipContent the content to be displayed in the tooltip
     */
    public fadeInTooltip( paraTooltipContent: any ): void {

        this.tooltip
            .transition()
            .duration(200)
            .style("opacity",0.9);

        this.tooltip
            .html( paraTooltipContent )
            .style("left", "0px")
            .style("top", "400px");
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
        this.renderedYAxis = this.trendVisualizationWrapper.append("g")
            .attr("class","yaxis")
            .call(this.yAxis);

        this.renderedXAxis = this.trendVisualizationWrapper.append("g")
            .attr("class","xaxis")
            .attr("transform", "translate(0," + this.height + ")")
            .append("g")
            .call(this.xAxis);

            this.trendVisualizationWrapper.call( d3Zoom.zoom().on("zoom", ()=>{

                //format x-axis to display hours and minutes at a specific scaling threshold
                if( d3Selection.event.transform.k > 7 ){
                    this.xAxis = d3Axis.axisBottom(this.xScale).tickFormat(d3TimeFormat.timeFormat("%d.%m. %H:%M"));
                }
                else {
                    this.xAxis = d3Axis.axisBottom(this.xScale).tickFormat(d3TimeFormat.timeFormat("%d.%m.%Y"));
                }

                this.xScaleZoomed = d3Selection.event.transform.rescaleX( this.xScale );
                this.renderedXAxis.call( this.xAxis.scale(this.xScaleZoomed) );

                const line = d3Shape.line()
                    .x((d)=>{ return this.xScaleZoomed( d[ 'x' ] ) })
                    .y((d)=>{ return this.yScale( d[ 'y' ] ) })
                    .curve(d3Shape.curveMonotoneX);

                //scale file stuff to zoom scale
                this.trendVisualizationWrapper.selectAll(".file-view-node")
                    .attr( "cx", (d)=>{ return this.xScaleZoomed( new Date(d.c.datetime) ) } );
                this.trendVisualizationWrapper.selectAll(".file-view-link")
                    .attr( "d", line );


                //scale commit stuff to zoom scale
                this.trendVisualizationWrapper.selectAll(".commit-view-node")
                    .attr( "cx", (d)=>{ return this.xScaleZoomed( new Date(d.datetime) ) } );
                this.trendVisualizationWrapper.selectAll(".commit-view-balloon-line")
                    .attr( "x1", (d)=>{ return this.xScaleZoomed( new Date(d.datetime) ) } )
                    .attr( "x2", (d)=>{ return this.xScaleZoomed( new Date(d.datetime) ) } );

        } ) );
    }


    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderCommitViewNodes( paraCommitNodesData: any, paraQualityMetric: any ): void {
        let that = this;
        let currentXScale = this.getCurrentXScale();

        this.trendVisualizationWrapper.append('g').selectAll('rect')
        .data(paraCommitNodesData)
        .enter()
        .append('circle')
        .attr('class','commit-view-node '+paraQualityMetric)
        .attr('cx', (d)=>{ return currentXScale( new Date(d.datetime) ) })
        .attr('cy', (d)=>{

            //TODO besser machen
            if( paraQualityMetric == "m1" ){
                return this.yScale( d.quality_metric_1*100 )
            }
            if( paraQualityMetric == "m2" ){
                return this.yScale( d.quality_metric_2*100 )
            }
            if( paraQualityMetric == "m3" ){
                return this.yScale( d.quality_metric_3*100 )
            }
            //TODO ende besser machen
            //return this.yScale( d.quality_metric_1*100 )
        })
        .attr('fill', 'teal')
        .attr('r', (d)=>{ return d.fileCount*2 })
        .attr('fill', 'teal')
            .on("mouseover", function(d) {

                let qualityValue = 0;
                //TODO besser machen
                if( paraQualityMetric == "m1" ){
                    qualityValue = d.quality_metric_1;
                }
                if( paraQualityMetric == "m2" ){
                    qualityValue = d.quality_metric_2;
                }
                if( paraQualityMetric == "m3" ){
                    qualityValue = d.quality_metric_3;
                }
                //TODO ende besser machen

                that.fadeInTooltip(
                    "Quality Value: " + Math.round( qualityValue*100*100 ) / 100 + " %<br/>" +
                    "Commit Time: " + moment( d.datetime ).format( 'MMMM Do YYYY, HH:mm:ss' ) + "<br/>" +
                    "SHA: " + d.id + "<br/>" +
                    "Filecount: " + d.fileCount
                )})
            .on("mouseout",(d)=>{
                this.fadeOutTooltip();
            });
    }

    /**
    * renders vertical lines from x-axis to commit node
     */
    public renderCommitViewBalloonLines( paraCommitNodesData: any, paraQualityMetric: any ): void {
        //let that = this;
        let currentXScale = this.getCurrentXScale();

        this.trendVisualizationWrapper.append('g').selectAll('rect')
            .data(paraCommitNodesData)
            .enter()
            .append('line')
            .attr('class','commit-view-balloon-line '+paraQualityMetric)
            .attr('x1', (d)=>{ return currentXScale( new Date(d.datetime) ) })
            .attr('x2', (d)=>{ return currentXScale( new Date(d.datetime) ) })
            .attr('y1', this.height )
            .attr('y2', (d)=>{

                //TODO besser machen
                if( paraQualityMetric == "m1" ){
                    return this.yScale( d.quality_metric_1*100 )
                }
                if( paraQualityMetric == "m2" ){
                    return this.yScale( d.quality_metric_2*100 )
                }
                if( paraQualityMetric == "m3" ){
                    return this.yScale( d.quality_metric_3*100 )
                }
                //TODO ende besser machen
                //return this.yScale( d.quality_metric_1*100 )
            })
            .attr("stroke-width", 2)
            .attr("stroke", "red");
    }
    /**
     * renders links based on the order of commits
     * @param paraCommitNodesData commit data as array from the backend
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderCommitViewLinks( paraCommitNodesData: any, paraCommitQuality: string ): void {
        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return d[ 'x' ] })
            .y((d)=>{ return d[ 'y' ] })
            .curve(d3Shape.curveMonotoneX);


        let commitLinkArray = [];
        let dateCompare = this.utility.commitDatetimeComparer;
        let commitNodesSortedByDatetime = paraCommitNodesData.sort( dateCompare );



        commitNodesSortedByDatetime.forEach( (commitNode,i)=>{

            //TODO besser machen
            let metric = 0;

            if( paraCommitQuality == "m1" ){
                metric = commitNode.quality_metric_1*100;
            }
            if( paraCommitQuality == "m2" ){
                metric = commitNode.quality_metric_2*100;
            }
            if( paraCommitQuality == "m3" ){
                metric = commitNode.quality_metric_3*100;
            }
            //TODO ende besser machen

            commitLinkArray.push({
                "x": this.xScale( new Date(commitNode.datetime) ),
                "y": this.yScale( metric )
            });
        });

        this.trendVisualizationWrapper
            .append('path')
            .datum(commitLinkArray)
            .attr('class','commit-view-link '+paraCommitQuality)
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
        let that = this; //for use in mouseover callback
        let currentXScale = this.getCurrentXScale();

        //add main dot to fileview nodes
        this.trendVisualizationWrapper.append('g').selectAll('rect')
            .data(paraFileNodesData)
            .enter()
            .append('circle')
            .attr('class', (d)=>{ return 'file-view-node '+ d.f.name.split("/").join("").split(".").join("") } )
            .attr('cx', (d)=>{ return currentXScale( new Date(d.c.datetime) ) })
            .attr('cy', (d)=>{ return this.yScale( d.f.quality_metric_1*100 ) })
            .attr('stroke', (d)=>{ return this.fileColorLookupArray[d.f.name].color })
            .attr('r', 10)
            .on("dblclick", (d) => {
                this.showFileDetailView( d.f.hunks.join() );
            })
            .on("mouseover", function(d){
                d3Selection.select(this)
                    .transition()
                    .duration(200)
                    .attr('r',16);

                that.fadeInTooltip(
                    "Quality Value: " + Math.round( d.f.quality_metric_1*100*100 ) / 100 + " %<br/>" +
                                     "Commit Time: " + moment( d.c.datetime ).format( 'MMMM Do YYYY, HH:mm:ss' )


                );
            })
            .on("mouseout", function(){
                d3Selection.select(this)
                    .transition()
                    .duration(200)
                    .attr('r',10);

                that.fadeOutTooltip();
            });
    }


    /**
     * renders links based on the files paths through commits
     * @param paraCommitNodesData commit data as array from the backend
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderFileViewFileLinks( paraFileLinksData: any ): void {
        let currentXScale = this.getCurrentXScale();

        //d3 line generator
        const line = d3Shape.line()
            .x((d)=>{ return currentXScale( d[ 'x' ] ) })
            .y((d)=>{ return this.yScale( d[ 'y' ] ) })
            .curve(d3Shape.curveMonotoneX);

        let fileLinkArray = [];
        let dateCompare = this.utility.fileDatetimeComparer;
        let filesSortyByCommitDatetime = paraFileLinksData.sort( dateCompare );

        filesSortyByCommitDatetime.forEach( (file,i)=>{
            fileLinkArray.push({
                "x": new Date(file.c.datetime),
                "y": file.f.quality_metric_1*100,
                "color": file.f.color,
                "name": file.f.name
            });
        });

        this.trendVisualizationWrapper
            .append('path')
            .datum(fileLinkArray)
            .attr('class', (d)=>{ return 'file-view-link ' + d[0].name.split("/").join("").split(".").join("") } )
            .attr("fill", "none")
            .attr("stroke", (d)=>{
                return this.fileColorLookupArray[d[0].name].color;
            })
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line)
            .attr("clip-path","url(#clipper)");
    }

    /**
     * clears the view from all elements containing commit classes
     */
    public fadeCommitViewToBackground(): void {
        d3Selection.selectAll('.commit-view-node').transition().duration(700).style("opacity", 0.15);
        d3Selection.selectAll('.commit-view-link').transition().duration(700).style("opacity", 0.15);
        d3Selection.selectAll('.commit-view-balloon-line').transition().duration(700).style("opacity", 0.15);
    }


    /**
     * clears the view from all elements containing file classes
     */
    public fadeFileViewToBackground(): void {
            d3Selection.selectAll('.file-view-node').transition().duration(700).style("opacity", 0.15);
            d3Selection.selectAll('.file-view-link').transition().duration(700).style("opacity", 0.15);
    }

    /**
     * clears the view from all elements containing commit classes
     */
    public fadeCommitViewToForeGround(): void {
        d3Selection.selectAll('.commit-view-node').transition().duration(700).style("opacity", 1);
        d3Selection.selectAll('.commit-view-link').transition().duration(700).style("opacity", 1);
    }


    /**
     * clears the view from all elements containing file classes
     */
    public fadeFileViewToForeground(): void {
        d3Selection.selectAll('.file-view-node').transition().duration(700).style("opacity", 1);
        d3Selection.selectAll('.file-view-link').transition().duration(700).style("opacity", 1);
    }


    /**
     * switches between commit and file view
     * @param {number} paraView specifies the view is currently used
     */
    public addCommitQualityToVisualization(): void {

        let commitQuality = this.optionsPanelValueService.getCommitQualitySelectValue();

        if( commitQuality == '' ){
            return;
        }
        else {
            this.doCommitViewRequestAndRender( commitQuality );
        }

        return;
    }


    /**
     * adds the file to the visualization
     * @param {string} paraFilepath specifies the file data to be displayed
     */
    public addFileToVisualization(): void {

        let filepath = this.optionsPanelValueService.getFileSelectValue();

        if( filepath == '' ){
            return;
        }
        else {
            this.doFileViewRequestAndRender( filepath );
        }

        return;
    }

    /**
     * adds the file to the visualization
     * @param {string} paraFilepath specifies the file data to be displayed
     */
    public addFileListToVisualization(): void {

        let files = this.optionsPanelValueService.getSelectedFileList();

        for( let i=0; i<files.length; i++ ){
            let filepath = files[i];
            if( filepath == '' ){
                return;
            }
            else {
                this.doFileViewRequestAndRender( filepath );
            }
        }

        return;
    }

    public addCommitQualityListToVisualization(): void {

        let qualities = this.optionsPanelValueService.getSelectedCommitQualityList();

        for( let i=0; i<qualities.length; i++ ){

            if( qualities[i] == '' ){
                return;
            }
            else {
                this.doCommitViewRequestAndRender( qualities[i] );
            }
        }

        return;
    }

    /**
     * removes the file from the visualization
     * @param {string} paraFilepath specifies the file data to be removed
     */
    public removeFileFromVisualization(): void {
        let filepath = this.optionsPanelValueService.getFileRemovedValue();
        this.clearFileView( filepath );

        return;
    }

    public removeCommitQualityFromVisualization(): void {
        let commitQuality = this.optionsPanelValueService.getCommitQualityRemoveValue();
        this.clearCommitView( commitQuality );

        return;
    }




}

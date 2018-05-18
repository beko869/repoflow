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
import {DiffPanelValueService} from "../shared/DiffPanelValueService";


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

    @ViewChild('optionsPanel') optionsPanel;
    @ViewChild('codeEditor') codeEditor;
    @ViewChild('diffPanel') diffPanel;


    constructor( private utility: UtilityService, private optionsPanelValueService: OptionsPanelValueService, private diffPanelValueService: DiffPanelValueService ) {
        this.isFileDetailViewVisible = false;
        this.margin = {top:0, right:0, bottom:20, left:0};
        this.xScaleZoomed = null;
    }

    ngOnInit() {

        this.width = window.document.getElementById( 'trend-chart' ).getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = window.innerHeight*0.75 - this.margin.top - this.margin.bottom;


        d3Request.json(environment.dataHost + 'read/initial_data', (error, data) => {
            this.fileColorLookupArray = this.utility.createFileNameColorLookupForArray( data["file-colors"] );

            //this.initTooltip();
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
     * requests file data and renders the basic file view
     */
    public doFileViewRequestByFilePathAndRender( paraFilePath: string ) {
        this.fadeCommitViewToBackground();
        this.fadeFileViewToForeground();

        d3Request.json(environment.dataHost + 'read/file_data_by_name/'+encodeURIComponent( paraFilePath ), (error, data) => {
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
        //this.codeEditor.setLeftContent( paraCodeMirrorContent );
        //this.codeEditor.setRightContent( paraCodeMirrorContent );
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
        let currentXScale = this.getCurrentXScale();

        this.trendVisualizationWrapper.append('g').selectAll('rect')
        .data(paraCommitNodesData)
        .enter()
        .append('circle')
        .attr('class','commit-view-node '+paraQualityMetric)
        .attr('cx', (d)=>{ console.log(currentXScale( new Date(d.datetime) ));return currentXScale( new Date(d.datetime) ) })
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
        .attr('fill', '#ff7f00')
        .attr('r', (d)=>{ return d.fileCount*2 })
        .attr('fill', '#ff7f00')
        .on('click',(d)=>{
            this.renderFilesOfCommit( d.id );
        })
        .on("mouseover", (d)=>{

            let qualityValue = 0;
            //TODO besser machen
            if (paraQualityMetric == "m1") {
                qualityValue = d.quality_metric_1;
            }
            if (paraQualityMetric == "m2") {
                qualityValue = d.quality_metric_2;
            }
            if (paraQualityMetric == "m3") {
                qualityValue = d.quality_metric_3;
            }
            //TODO ende besser machen

            this.optionsPanelValueService.setInfo({
                "value": Math.round( qualityValue * 100 * 100 ) / 100 + " %",
                "sha": d.id,
                "time": moment(d.datetime).format('MMMM Do YYYY, HH:mm:ss'),
                "filecount": d.fileCount
            });
            this.optionsPanel.ref.markForCheck();

            this.renderDashedGuideLineToXAxis( new Date(d.datetime), qualityValue * 100 );
        })
        .on("mouseout",()=>{
            this.removeDashedGuideLines();
        });
    }

    /**
     * renders guidelines to the corresponding x axis to easily identify an exact value
     * @param paraX x coordinates non scaled but in right domain
     * @param paraY y coordinates non scaled but in right domain
     */
    public renderDashedGuideLineToXAxis( paraX, paraY ){
        let currentXScale = this.getCurrentXScale();

        this.trendVisualizationWrapper.append("g")
            .attr("class","guide-line x")
            .append("line")
            .attr('y1', this.yScale(paraY) ).attr('y2', this.yScale(paraY) )
            .attr("x1", 0 ).attr("x2", currentXScale( paraX ) )
            .attr("stroke-width", 1)
            .attr("stroke", "gray");
    }

    /**
     * renders guidelines to the corresponding y axis to easily identify an exact value
     * @param paraX x coordinates non scaled but in right domain
     * @param paraY y coordinates non scaled but in right domain
     */
    public renderDashedGuideLineToYAxis( paraX, paraY ){
        let currentXScale = this.getCurrentXScale();

        this.trendVisualizationWrapper.append("g")
            .attr("class","guide-line x")
            .append("line")
            .attr('y1', this.yScale(paraY) ).attr('y2', this.height )
            .attr("x1", currentXScale( paraX ) ).attr("x2", currentXScale( paraX ) )
            .attr("stroke-width", 1)
            .attr("stroke", "gray");
    }

    public removeDashedGuideLines(){
        d3Selection.selectAll('.guide-line').remove();
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
            .attr("stroke", "#ff7f00");
    }

    /**
     * requests file data and renders the basic commit view
     */
    public renderFilesOfCommit( paraSha: string ) {
        d3Request.json(environment.dataHost + 'read/file_data_by_sha/'+encodeURIComponent( paraSha ), (error, data) => {
            for( let i=0;i<data.files.length; i++ )
            {
                if( !this.optionsPanelValueService.getSelectedFileList().includes( data.files[i].f.name ) ){
                    this.optionsPanelValueService.setFileSelectValue( data.files[i].f.name );
                }
            }
            this.optionsPanel.ref.markForCheck();
            this.addFileListToVisualization();
        });
    }

    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderFileViewNodes( paraFileNodesData: any ): void {
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
            .on("click", (d) => {
                if( this.diffPanel.getLeftFileFixated() ) {
                    this.diffPanelValueService.setRightContent( d.f.fileContent )
                    this.diffPanel.setRightFileData( {fileName:d.f.name,sha:d.f.commitId} )
                }
                else {
                    this.diffPanelValueService.setLeftContent( d.f.fileContent )
                    this.diffPanel.setLeftFileData( {fileName:d.f.name,sha:d.f.commitId} );
                }

                //this.showFileDetailView( d.f.fileContent );
            })
            .on("mouseover", (d) => {
                this.optionsPanelValueService.setInfo( {
                    "filename":d.f.name,
                    "value": Math.round( d.f.quality_metric_1 * 100 * 100 ) / 100 + " %",
                    "sha":d.f.commitId,
                    "time":moment( d.c.datetime ).format( 'MMMM Do YYYY, HH:mm:ss' )
                } );
                this.optionsPanel.ref.markForCheck();

                this.renderDashedGuideLineToXAxis( new Date(d.c.datetime), d.f.quality_metric_1*100 );
                this.renderDashedGuideLineToYAxis( new Date(d.c.datetime), d.f.quality_metric_1*100 );

            })
            .on("mouseout", ()=>{
                this.removeDashedGuideLines();
            });
    }


    /**
     * renders links based on the files paths through commits
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

        filesSortyByCommitDatetime.forEach( (file)=>{
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
        d3Selection.selectAll('.commit-view-balloon-line').transition().duration(700).style("opacity", 1);
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
     */
    public addFileToVisualization(): void {

        let filepath = this.optionsPanelValueService.getFileSelectValue();

        if( filepath == '' ){
            return;
        }
        else {
            this.doFileViewRequestByFilePathAndRender( filepath );
        }

        return;
    }

    /**
     * adds the file to the visualization
     */
    public addFileListToVisualization(): void {
        this.clearFileView();

        let files = this.optionsPanelValueService.getSelectedFileList();

        for( let i=0; i<files.length; i++ ){
            let filepath = files[i];
            if( filepath == '' ){
                return;
            }
            else {
                this.doFileViewRequestByFilePathAndRender( filepath );
            }
        }

        return;
    }

    public addCommitQualityListToVisualization(): void {
        this.clearCommitView();

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
     * deleting file in options panel removes file from the visualization
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

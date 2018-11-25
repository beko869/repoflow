import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import * as d3 from 'd3';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Shape from 'd3-shape';
import * as d3Zoom from 'd3-zoom';
import * as moment from 'moment';
import {UtilityService} from '../shared/utility.service';
import {OptionsPanelValuesService} from "../shared/options-panel-values.service";
import {DiffPanelValuesService} from "../shared/diff-panel-values.service";
import {ApiService} from "../shared/api.service";
import {D3Helper} from "../d3-helper/d3-helper";


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
    private normalizationQuotient: number;
    private normalizationMinValue: number;
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
    private qualityColorLookupArray: any;
    private isFileDetailViewVisible: boolean;
    private diffPanel: any;
    private contextMenu: any;

    @ViewChild('optionsPanel') optionsPanel;
    @ViewChild('codeEditor') codeEditor;
    @ViewChild('trendContainer') trendContainer: ElementRef;


    constructor(private utility: UtilityService, private optionsPanelValueService: OptionsPanelValuesService, private diffPanelValueService: DiffPanelValuesService, private apiService: ApiService ) {
        this.isFileDetailViewVisible = false;
        this.margin = {top:0, right:0, bottom:20, left:0};
        this.xScaleZoomed = null;
    }

    ngOnInit() {
        this.width = window.document.getElementById( 'trend-chart' ).getBoundingClientRect().width;
        this.height = window.innerHeight*0.80 - this.margin.top - this.margin.bottom;
        this.diffPanel = this.optionsPanel.getDiffPanel();
        this.apiService.getInitialVisualizationData()
            .subscribe( (data)=>{
                this.fileColorLookupArray = this.utility.createFileNameColorLookupForArray( data["file-colors"] );
                this.qualityColorLookupArray = this.utility.createQualityColorLookupForArray( data["quality-metrics"] );
                this.initScales( data["commit-nodes"] );
                this.initAxis();
                this.initSvg();
                this.renderAxis();
                this.initOptionsPanel( data["file-names"], this.fileColorLookupArray, data["quality-metrics"] );
                this.initGridLines();

                // add the X gridlines
                /*this.trendVisualizationWrapper.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + this.height + ")")
                    .call(this.makeXGridLines()
                        .tickSize(-this.height)
                        .tickFormat("")
                    )

                // add the Y gridlines
                this.trendVisualizationWrapper.append("g")
                    .attr("class", "grid")
                    .call(this.makeYGridlines()
                        .tickSize(-this.width)
                        .tickFormat("")
                    )*/

        });
    }

    /**
     * requests commit data and renders the basic commit view
     */
    public doCommitViewRequestAndRender( paraQuality:string ) {
        this.fadeFileViewToBackground();
        this.fadeCommitViewToForeGround();

        this.apiService.getCommitData( paraQuality )
            .subscribe( (data)=>{
                this.renderCommitView( data, paraQuality );
            });
    }


    /**
     * requests file data and renders the basic file view
     */
    public doFileViewRequestByFilePathAndRender( paraFilePath: string, paraQuality?: string ) {
        this.fadeCommitViewToBackground();
        this.fadeFileViewToForeground();

        this.apiService.getFileDataByFilePath( paraFilePath )
            .subscribe( (data)=>{
                this.renderFileView( data, paraQuality );
            });
    }


    /**
     * renders the commit view with the given data array
     * @param paraData array containing commit nodes data
     * @param paraCommitQuality string determining which commit quality gets rendered
     */
    public renderCommitView( paraData: any, paraCommitQuality: string ): void {
        this.renderCommitViewNodes( paraData["commit-nodes"], paraCommitQuality, paraData[ 'min_max_values' ] );
        this.renderCommitViewBalloonLines( paraData["commit-nodes"], paraCommitQuality, paraData[ 'min_max_values' ] );
    }


    /**
     * renders the file view with the given data array
     * @param paraData array containing files data
     */
    public renderFileView( paraData: any, paraQuality?: string ): void {
        this.renderFileViewNodes( paraData["files"], paraQuality );
        this.renderFileViewFileLinks( paraData["files"], paraQuality )
    }


    /**
     * renders the file view with the given data array
     * @param paraData array containing files data
     */
    public renderModuleTrendView(): void {
        this.clearModuleView();
        this.fadeCommitViewToBackground();

        this.apiService.getModuleFileData( this.optionsPanelValueService.getModuleFileData().join(), this.optionsPanelValueService.getQualityMetricSelectValue() )
            .subscribe( (data)=>{
                this.renderModuleViewNodes( data.files );
                this.renderModuleViewLinks( data.files );
            });

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
     * clears the view from all elements containing file classes
     */
    public clearModuleView(): void {
        d3Selection.selectAll('.module-view-node').remove();
        d3Selection.selectAll('.module-view-link').remove();

    }

    /**
     * resets the trendVisualizationWrapper to visible
     */
    public clearFileDetailView(): void {
        //this.isFileDetailViewVisible = false;
        //this.trendVisualizationWrapper.attr("display","inline");
    }


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
            .attr("transform","translate(0,"+this.margin.top + ")")
            .on('contextmenu', ()=>{
                d3Selection.event.preventDefault();
            });

        this.trendVisualizationWrapper
            .append("defs")
            .append("clipPath")
            .attr("id", "clipper")
            .append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width",this.width)
            .attr("height",this.height);

        this.trendVisualizationWrapper
            .on('click',()=>{
                this.contextMenu.style('display','none');
            });

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
    public initOptionsPanel( paraFileNamesArray: string[], paraFileColorsArray: any, paraQualityMetricArray: any ): void {
        //this.optionsPanel.setFileList( paraFileNamesArray );
        this.optionsPanel.setFileColorList( paraFileColorsArray );
        this.optionsPanel.setQualityMetricList( paraQualityMetricArray );
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
                } else {
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

                //scale module stuff to zoom scale
                this.trendVisualizationWrapper.selectAll(".module-view-node")
                    .attr( "cx", (d)=>{ return this.xScaleZoomed( new Date(d.c.datetime) ) } );
                this.trendVisualizationWrapper.selectAll(".module-view-link")
                    .attr( "d", line );

        } ) );
    }


    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderCommitViewNodes( paraCommitNodesData: any, paraQualityMetric: any, paraMinMaxValues: any ): void {
        let currentXScale = this.getCurrentXScale();

        this.normalizationQuotient = paraMinMaxValues[0].max - paraMinMaxValues[0].min;
        this.normalizationMinValue = paraMinMaxValues[0].min;

        this.trendVisualizationWrapper.append('g').selectAll('rect')
        .data(paraCommitNodesData)
        .enter()
        .append('circle')
        .attr('class','commit-view-node ' + paraQualityMetric)
        .attr('cx', (d)=>{ return currentXScale( new Date(d.datetime) ) })
        .attr('cy', (d)=>{
            return this.yScale( this.getNormalizedValue( ( d[paraQualityMetric] > 0 ? d[paraQualityMetric] : 0 ) ) );
        })
        .attr('fill', (d)=>{ return this.qualityColorLookupArray[paraQualityMetric]; })
        .attr('r', (d)=>{ return 15 })
        .on('click',(d)=>{
            this.renderFilesOfCommit( d.id );
        })
        .on("mouseover", (d)=>{
            let qualityValue = this.getNormalizedValue( d[paraQualityMetric] );

            this.optionsPanelValueService.setInfo({
                "value": d[paraQualityMetric] + " " + this.optionsPanelValueService.lookupQualityNameForKey( paraQualityMetric ),
                "sha": d.id,
                "time": moment(d.datetime).format('MMMM Do YYYY, HH:mm:ss'),
                "filecount": d.fileCount
            });
            this.optionsPanel.ref.markForCheck();

            this.renderDashedGuideLineToXAxis( new Date(d.datetime), qualityValue );
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
    public renderDashedGuideLineToXAxis( paraX, paraY, paraNormMin = null, paraNormQuot = null ){
        let currentXScale = this.getCurrentXScale();

        this.trendVisualizationWrapper.append("g")
            .attr("class","guide-line x")
            .append("line")
            .attr('y1', ( paraY > 0 ? this.yScale(paraY) : 0 ) ).attr('y2', ( paraY > 0 ? this.yScale(paraY) : 0 ) )
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
            .attr('y1', ( paraY > 0 ? this.yScale( paraY ) : 0 ) ).attr( 'y2', this.height )
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
    public renderCommitViewBalloonLines( paraCommitNodesData: any, paraQualityMetric: any, paraMinMaxValues: any ): void {
        //let that = this;
        let currentXScale = this.getCurrentXScale();

        this.normalizationQuotient = paraMinMaxValues[0].max - paraMinMaxValues[0].min;
        this.normalizationMinValue = paraMinMaxValues[0].min;

        this.trendVisualizationWrapper.append('g').selectAll('rect')
            .data(paraCommitNodesData)
            .enter()
            .append('line')
            .attr('class','commit-view-balloon-line ' + paraQualityMetric)
            .attr('x1', (d)=>{ return currentXScale( new Date(d.datetime) ) })
            .attr('x2', (d)=>{ return currentXScale( new Date(d.datetime) ) })
            .attr('y1', this.height )
            .attr('y2', (d)=>{
                return this.yScale( this.getNormalizedValue( d[paraQualityMetric] ) );
            })
            .attr("stroke-width", 2)
            .attr("stroke", this.qualityColorLookupArray[paraQualityMetric]);
    }

    /**
     * requests file data and renders the basic commit view
     */
    public renderFilesOfCommit( paraSha: string ) {
        this.apiService.getFileDataBySHAAndQualityKey( paraSha, this.optionsPanelValueService.getQualityMetricSelectValue() )
            .subscribe( (data)=>{
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
    public renderFileViewNodes( paraFileNodesData: any, paraQuality?: string ): void {
        let currentXScale = this.getCurrentXScale();
        let that = this;

        //if paraQuality is set, use it, else use the selected quality identifier from the dropdown
        let qualityIdentifier = paraQuality ? paraQuality : this.optionsPanelValueService.getQualityMetricSelectValue();

        this.apiService.getMinMaxOfMetric( qualityIdentifier )
            .subscribe(
                (callResult)=>{
                        this.normalizationQuotient = callResult.min_max_values[0].max - callResult.min_max_values[0].min;
                        this.normalizationMinValue = callResult.min_max_values[0].min;
                    },
                    (error)=>{
                        console.log(error);
                    },
                    ()=>{
                        //console.log(qualityIdentifier);
                        //console.log( this.normalizationQuotient );
                        //console.log( this.normalizationMinValue );

                        //add main dot to fileview nodes
                        let currentNode = this.trendVisualizationWrapper.append('g').selectAll('rect')
                            .data(paraFileNodesData)
                            .enter()
                            .append('circle')
                            .attr('class', (d)=>{ return 'file-view-node '+ d.f.name.split("/").join("").split(".").join("") } )
                            .attr('cx', (d)=>{ return currentXScale( new Date(d.c.datetime) ) })
                            .attr('cy', (d)=>{
                                let qualityValue = 0;
                                if( d.f.status != 'deleted' ){
                                    qualityValue = this.getNormalizedValue( d.f[ qualityIdentifier ] );
                                }
                                return this.yScale( qualityValue );

                            })
                            .attr('stroke', (d)=>{ return this.fileColorLookupArray[d.f.name].color })
                            .attr('r', 8)
                            .on('contextmenu', function(d) {
                                that.contextMenu = that.getContextMenuForFileViewNode( d );
                                let coords = d3Selection.mouse(this);

                                that.contextMenu.attr('transform', 'translate(' + coords[0] + ',' + coords[1] + ')');
                                that.contextMenu.style('display', 'block');
                                that.contextMenu.datum(d);

                                d3Selection.event.preventDefault();
                            } );

                        currentNode.on("click", function(d) {
                            if( that.diffPanel.getLeftFileFixated() ) {
                                that.diffPanelValueService.setRightContent( d.f.fileContent )
                                that.diffPanel.setRightFileData( {fileName:d.f.name,sha:d.f.commitId} )

                                d3Selection.select('.right-fixated-file-node')
                                    .attr('class','file-view-node '+ d.f.name.split("/").join("").split(".").join(""))
                                    .attr('r',10)
                                    .attr('stroke',that.fileColorLookupArray[d.f.name].color );

                                d3Selection.select(this)
                                    .attr('class','file-view-node '+ d.f.name.split("/").join("").split(".").join("") + ' right-fixated-file-node')
                                    .attr('r',15)
                                    .attr('stroke','darkorchid');
                            }
                            else {
                                that.diffPanelValueService.setLeftContent( d.f.fileContent )
                                that.diffPanel.setLeftFileData( {fileName:d.f.name,sha:d.f.commitId} );

                                d3Selection.select('.left-fixated-file-node')
                                    .attr('r',10)
                                    .attr('class','file-view-node '+ d.f.name.split("/").join("").split(".").join(""))
                                    .attr('stroke',that.fileColorLookupArray[d.f.name].color );

                                d3Selection.select(this)
                                    .attr('class','file-view-node '+ d.f.name.split("/").join("").split(".").join("") + ' left-fixated-file-node')
                                    .attr('r',15)
                                    .attr('stroke','darkcyan');

                            }

                            //this.showFileDetailView( d.f.fileContent );
                        })
                            .on("mouseover", (d) => {
                                this.optionsPanelValueService.setInfo( {
                                    "filename":d.f.name,
                                    "value": d.f[qualityIdentifier] + " " + qualityIdentifier,
                                    "sha":d.f.commitId,
                                    "time":moment( d.c.datetime ).format( 'MMMM Do YYYY, HH:mm:ss' )
                                } );
                                this.optionsPanel.ref.markForCheck();

                                this.renderDashedGuideLineToXAxis( new Date(d.c.datetime), this.getNormalizedValue( d.f[ qualityIdentifier ] ) );
                                this.renderDashedGuideLineToYAxis( new Date(d.c.datetime), this.getNormalizedValue( d.f[ qualityIdentifier ] ) );

                            })
                            .on("mouseout", ()=>{
                                this.removeDashedGuideLines();
                            });
                    });



    }


    /**
     * renders links based on the files paths through commits
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderFileViewFileLinks( paraFileLinksData: any, paraQuality?: string ): void {
        let currentXScale = this.getCurrentXScale();

        //if paraQuality is set, use it, else use the selected quality identifier from the dropdown
        let qualityIdentifier = paraQuality ? paraQuality : this.optionsPanelValueService.getQualityMetricSelectValue();
        console.log(qualityIdentifier);

        //erst quotient checken für normalisierung auf den achsen
        //in der complete funktion passiert dann das ganze rendering
        this.apiService.getMinMaxOfMetric( qualityIdentifier )
            .subscribe(
                (callResult)=>{
                    this.normalizationQuotient = callResult.min_max_values[0].max - callResult.min_max_values[0].min;
                    this.normalizationMinValue = callResult.min_max_values[0].min;
                },
                (error)=>{
                    console.log(error);
                },
                ()=>{
                    //d3 line generator
                    const line = d3Shape.line()
                        .x((d)=>{ return currentXScale( d[ 'x' ] ) })
                        .y((d)=>{ return this.yScale( d[ 'y' ] ) })
                        .curve(d3Shape.curveMonotoneX);

                    let fileLinkArray = [];
                    let dateCompare = this.utility.fileDatetimeComparer;
                    let filesSortyByCommitDatetime = paraFileLinksData.sort( dateCompare );

                    filesSortyByCommitDatetime.forEach( (file)=>{
                        let qualityValue = 0;
                        if( file.f.status != 'deleted' ){
                            qualityValue = this.getNormalizedValue( file.f[ qualityIdentifier ] );
                        }

                        fileLinkArray.push({
                            "x": new Date(file.c.datetime),
                            "y": qualityValue,
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
                });
    }


    /**
     * renders the commit nodes retrieved from the backend
     */
    public renderModuleViewNodes( paraFileNodesData: any ): void {
        let currentXScale = this.getCurrentXScale();
        let that = this;

        //add main dot to fileview nodes
        let currentNode = this.trendVisualizationWrapper.append('g').selectAll('rect')
            .data(paraFileNodesData)
            .enter()
            .append('circle')
            .attr('class', (d)=>{ return 'module-view-node '+ d.f.name.split("/").join("").split(".").join("") } )
            .attr('cx', (d)=>{ return currentXScale( new Date(d.c.datetime) ) })
            .attr('cy', (d)=>{
                let qualityValue = 0;
                if( d.f.status != 'deleted' ){
                    qualityValue = this.getNormalizedValue( d.f[ this.optionsPanelValueService.getQualityMetricSelectValue()] );
                }
                return this.yScale( qualityValue );

            })
            .attr('stroke', (d)=>{ return 'red' })
            .attr('r', 10);

        currentNode
            .on("mouseover", (d) => {
                this.optionsPanelValueService.setInfo( {
                    "filename":d.f.name,
                    "value": d.f[this.optionsPanelValueService.getQualityMetricSelectValue()] + " " + this.optionsPanelValueService.getQualityMetricSelectValue(),
                    "sha":d.f.commitId,
                    "time":moment( d.c.datetime ).format( 'MMMM Do YYYY, HH:mm:ss' )
                } );
                this.optionsPanel.ref.markForCheck();

                this.renderDashedGuideLineToXAxis( new Date(d.c.datetime), this.getNormalizedValue( d.f[this.optionsPanelValueService.getQualityMetricSelectValue()] ) );
                this.renderDashedGuideLineToYAxis( new Date(d.c.datetime), this.getNormalizedValue( d.f[this.optionsPanelValueService.getQualityMetricSelectValue()] ) );

            })
            .on("mouseout", ()=>{
                this.removeDashedGuideLines();
            });
    }


    /**
     * renders links based on the files paths through commits
     * @param paraFileLinksData file path data as array from the backend
     */
    public renderModuleViewLinks( paraFileLinksData: any ): void {
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
            let qualityValue = 0;
            if( file.f.status != 'deleted' ){
                qualityValue = this.getNormalizedValue( file.f[ this.optionsPanelValueService.getQualityMetricSelectValue()] );
            }

            fileLinkArray.push({
                "x": new Date(file.c.datetime),
                "y": qualityValue,
                "color": file.f.color,
                "name": file.f.name
            });
        });

        this.trendVisualizationWrapper
            .append('path')
            .datum(fileLinkArray)
            .attr('class', (d)=>{ return 'module-view-link ' + d[0].name.split("/").join("").split(".").join("") } )
            .attr("fill", "none")
            .attr("stroke", (d)=>{
                return 'red';
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
     * sets values for computing normalized values
     */
    public qualityMetricChanged(): void {

        //set min and max for axis rendering
        this.apiService.getMinMaxOfMetric( this.optionsPanelValueService.getQualityMetricSelectValue() )
            .subscribe( (callResult)=>{
                this.normalizationQuotient = callResult.min_max_values[0].max - callResult.min_max_values[0].min;
                this.normalizationMinValue = callResult.min_max_values[0].min;
        });

        //set file select list
        this.apiService.getFileDataByFileTypesOfQualityMetric( this.optionsPanelValueService.getQualityMetricSelectValue() )
            .subscribe( ( fileList )=>{
                this.optionsPanelValueService.setFileList( fileList.matched_file_names );
                this.optionsPanel.ref.markForCheck();
        });
    }

    /**
     * normalizes the given value in a 1...100 range
     * @param paraValue
     * @returns {number}
     */
    public getNormalizedValue( paraValue ): number {

        return ( paraValue - this.normalizationMinValue ) / this.normalizationQuotient * 100;
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
        //this.clearFileView();

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

    public addCommitCompareQualityListToVisualization(): void {
        let qualities = this.optionsPanelValueService.getCommitQualityCompareValues();
        this.clearCommitView();

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
     * renders gridlines into the trend chart svg
     */
    public initGridLines(): void {
        this.trendVisualizationWrapper
            .append("g")
            .attr("class", "grid")
            .call( this.generateYAxisTicks().tickSize(this.width).tickFormat("") );

        this.trendVisualizationWrapper
            .append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + this.height + ")")
            .call( this.generateXAxisTicks().tickSize(-this.height).tickFormat("") );
    }

    // gridlines in x axis function
    public generateXAxisTicks() {
        return this.xAxis.ticks(10);
    }

    // gridlines in y axis function
    public generateYAxisTicks() {
        return this.yAxis.ticks(10);
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

    public getContextMenuForFileViewNode( data: any ): any {
        let filename = data.f.name;

        let qualityList = this.optionsPanelValueService.getQualityMetricListForSelect();
        let menu = [];

        //start at 1 because of bitte wählen
        for( let i = 1; i < qualityList.length; i++) {

            menu.push({
                title: 'Compare this trend line to ' + qualityList[i].text,
                action: () => {
                    this.doFileViewRequestByFilePathAndRender( filename, qualityList[i].id );
                }
            });
        }

        /* build context menu */
        let m = this.trendVisualizationWrapper.append("g");
        m.style('display', 'none');

        let r = m.append('rect')
            .attr('height', menu.length * 25)
            .style('fill', "#eee");

        let t = m.selectAll('menu_item')
            .data(menu)
            .enter()
            .append('g')
            .attr('transform', function(d, i) {
                return 'translate(' + 10 + ',' + ((i + 1) * 20) + ')';
            })
            .on('mouseover', function(d){
                d3Selection.select(this).style('fill', 'steelblue');
                d3Selection.select(this).style('cursor', 'pointer');
            })
            .on('mouseout', function(d){
                d3Selection.select(this).style('fill', 'black');
            })
            .on('click', function(d,i){
                d.action(d,i);
            })
            .attr('class', 'context-menu-item')
            .append('text')
            .text(function(d) {
                return d.title;
            });

        let w = 0;
        t.each(function(d){
            let l = this.getComputedTextLength();
            if (l > w) w = l;
        });
        r.attr('width', w + 20);

        return m;
    }
}

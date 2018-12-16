import { Component, OnInit } from '@angular/core';
import {OptionsPanelValuesService} from "../shared/options-panel-values.service";
import {UtilityService} from '../shared/utility.service';


@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  providers: [UtilityService],
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  constructor(private optionsPanelValueService:OptionsPanelValuesService, private utility: UtilityService) { }

  public lookupArray:any = [];

  ngOnInit() {

  }

  public getQualityMetricList() : any {
    if(this.optionsPanelValueService.getQualityMetricListForSelect() != undefined){
        return this.optionsPanelValueService.getQualityMetricListForSelect().slice(1);
    }
    return []
  }

  public setLookupArray( paraArray:any ) : any {
      console.log(paraArray);
      return this.lookupArray = paraArray;
  }

}

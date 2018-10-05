import { Component, OnInit } from '@angular/core';
import {OptionsPanelValuesService} from "../shared/options-panel-values.service";

@Component({
  selector: 'app-stats-panel',
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.css']
})
export class StatsPanelComponent implements OnInit {

  constructor( private optionsPanelValueService:OptionsPanelValuesService ) { }

  ngOnInit() {
  }

  public getInfo(){
      return this.optionsPanelValueService.getInfo();
  }
}

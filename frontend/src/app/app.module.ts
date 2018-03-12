import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Angular2FontawesomeModule } from 'angular2-fontawesome';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { OptionsPanelComponent } from './options-panel/options-panel.component';
import { TrendChartComponent } from './trend-chart/trend-chart.component';
import { OptionsPanelValueService } from "./shared/OptionsPanelValueService";
import { UtilityService } from "./shared/UtilityService";

@NgModule({
  declarations: [
    AppComponent,
    OptionsPanelComponent,
    TrendChartComponent
  ],
  imports: [
    BrowserModule,
    Angular2FontawesomeModule,
    CodemirrorModule,
    FormsModule,
    RouterModule.forRoot([
        {
          path: 'trend',
          component: TrendChartComponent
        }
    ])
  ],
  providers: [OptionsPanelValueService,UtilityService],
  bootstrap: [AppComponent]
})
export class AppModule { }

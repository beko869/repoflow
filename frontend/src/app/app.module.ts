import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { OptionsPanelComponent } from './options-panel/options-panel.component';
import { TrendChartComponent } from './trend-chart/trend-chart.component';
import { OptionsPanelValueService } from "./shared/OptionsPanelValueService";

@NgModule({
  declarations: [
    AppComponent,
    OptionsPanelComponent,
    TrendChartComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
        {
          path: 'trend',
          component: TrendChartComponent
        }
    ])
  ],
  providers: [OptionsPanelValueService],
  bootstrap: [AppComponent]
})
export class AppModule { }

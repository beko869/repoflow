import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Angular2FontawesomeModule } from 'angular2-fontawesome';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { Select2Module } from "ng2-select2";

import { AppComponent } from './app.component';
import { OptionsPanelComponent } from './options-panel/options-panel.component';
import { TrendChartComponent } from './trend-chart/trend-chart.component';
import { OptionsPanelValueService } from "./shared/OptionsPanelValueService";
import { UtilityService } from "./shared/UtilityService";
import { LegendComponent } from './legend/legend.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { DiffPanelComponent } from './diff-panel/diff-panel.component';
import { DiffPanelValueService } from "./shared/DiffPanelValueService";
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    OptionsPanelComponent,
    TrendChartComponent,
    LegendComponent,
    CodeEditorComponent,
    DiffPanelComponent,
    ModalDialogComponent
  ],
  imports: [
    BrowserModule,
    Angular2FontawesomeModule,
    CodemirrorModule,
    FormsModule,
    Select2Module,
    RouterModule.forRoot([
        {
          path: 'trend',
          component: TrendChartComponent
        }
    ])
  ],
  providers: [OptionsPanelValueService,UtilityService,DiffPanelValueService],
  bootstrap: [AppComponent]
})
export class AppModule { }

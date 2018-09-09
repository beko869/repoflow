import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Angular2FontawesomeModule } from 'angular2-fontawesome';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { Select2Module } from "ng2-select2";
import { HttpClientModule } from "@angular/common/http";
import { DndModule } from "ng2-dnd";

import { AppComponent } from './app.component';
import { OptionsPanelComponent } from './options-panel/options-panel.component';
import { TrendChartComponent } from './trend-chart/trend-chart.component';
import { OptionsPanelValuesService } from "./shared/options-panel-values.service";
import { UtilityService } from "./shared/utility.service";
import { LegendComponent } from './legend/legend.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { DiffPanelComponent } from './diff-panel/diff-panel.component';
import { DiffPanelValuesService } from "./shared/diff-panel-values.service";
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { ApiService } from "./shared/api.service";

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
    HttpClientModule,
    Angular2FontawesomeModule,
    CodemirrorModule,
    FormsModule,
    Select2Module,
    DndModule.forRoot(),
    RouterModule.forRoot([
        {
          path: 'trend',
          component: TrendChartComponent
        }
    ])
  ],
  providers: [
      OptionsPanelValuesService,
      UtilityService,
      DiffPanelValuesService,
      ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }

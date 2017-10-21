import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { D3PlaygroundComponent } from './d3-playground/d3-playground.component';
import { OptionsPanelComponent } from './options-panel/options-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    D3PlaygroundComponent,
    OptionsPanelComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
        {
          path: 'playground',
          component: D3PlaygroundComponent
        }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
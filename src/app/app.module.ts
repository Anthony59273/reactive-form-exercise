import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { DeviceManagementComponent } from './components/device-management/device-management.component';

@NgModule({
  declarations: [
    AppComponent,
    DeviceManagementComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CustomMaterialModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

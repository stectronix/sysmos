import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ZoneSettingsPage } from './zone-settings';

@NgModule({
  declarations: [
    ZoneSettingsPage
  ],
  imports: [
    IonicPageModule.forChild(ZoneSettingsPage),
  ],
})
export class ZoneSettingsPageModule { }

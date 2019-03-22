import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WifiSettingsPage } from './wifi-settings';

@NgModule({
  declarations: [
    WifiSettingsPage
  ],
  imports: [
    IonicPageModule.forChild(WifiSettingsPage),
  ],
})
export class WifiSettingsPageModule { }

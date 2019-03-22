import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NetworkSettingsPage } from './network-settings';

@NgModule({
  declarations: [
    NetworkSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(NetworkSettingsPage),
  ],
})
export class NetworkSettingsPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Alarm } from './alarm';

@NgModule({
  declarations: [
    Alarm,
  ],
  imports: [
    IonicPageModule.forChild(Alarm),
  ],
  exports: [
    Alarm
  ]
})
export class AlarmModule {}

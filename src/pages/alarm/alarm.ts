import { DataServiceProvider } from './../../providers/data-service/data-service';
import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-alarm',
  templateUrl: 'alarm.html'
})
export class Alarm {

  alarmId: number = -1;
  availableAlarms = [];

  audioPlayer = null;
  constructor(public navCtrl: NavController, public dataService: DataServiceProvider) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmSettingsPage');
    console.log(this.dataService.deviceStatus.alarm);
    this.alarmId = this.dataService.deviceStatus.alarm;
    this.availableAlarms = this.dataService.getAlarms();
    console.log('this.availableAlarms');
    console.log(this.availableAlarms);
    console.log(this.dataService.getAlarms());
  }

  selectAlarm(alarmIndex) {

    this.alarmId = alarmIndex;

    if (this.audioPlayer !== null) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }

    this.audioPlayer = new Audio(this.availableAlarms[alarmIndex].file);
    this.audioPlayer.play();
  }

  saveAlarm() {
    this.dataService.saveAlarm(this.alarmId);
  }

}

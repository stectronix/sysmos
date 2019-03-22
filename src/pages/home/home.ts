import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DataServiceProvider } from './../../providers/data-service/data-service';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class Home {

  deviceStatus = null;

  availableAlarms = [];

  constructor(public dataService: DataServiceProvider, private navCtrl: NavController) {
    this.deviceStatus = this.dataService.getDeviceStatus();
    this.availableAlarms = this.dataService.getAlarms();
  }

  navTo(page) {

    switch (page) {
      case 'network':
      case 'sysmos':
        this.selectTab(1);
        break;
      case 'alarm':
        this.selectTab(2); break;
    }
  }

  browseTo(socialMedia) {
    this.dataService.openSocialUrl(socialMedia);
  }

  selectTab(index: number) {
    this.navCtrl.parent.select(index);
  }

}

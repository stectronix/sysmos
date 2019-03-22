import { DataServiceProvider } from './../../providers/data-service/data-service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the WifiSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-zone-settings',
  templateUrl: 'zone-settings.html',
})
export class ZoneSettingsPage {

  platformUrl = null;
  deviceStatus = null;

  selectedZones = [];
  availableZones = [];

  bleLoading: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private dataService: DataServiceProvider) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ZoneSettingsPage');
    this.platformUrl = this.dataService.getPlatformUrl();
    this.deviceStatus = this.dataService.getDeviceStatus();
    this.availableZones = this.dataService.getAvailableZones();
    this.selectedZones = typeof this.deviceStatus.zones !== 'undefined' ? this.deviceStatus.zones : [];
  }

  selectZone(id) {
    console.log(id);

    let selectedIndex = -1;
    for (let i = 0; i < this.selectedZones.length; i++) {
      if (this.selectedZones[i] == id) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex !== -1) {
      console.log('deleting');
      this.selectedZones.splice(selectedIndex, 1);
    } else {
      console.log('adding');
      this.selectedZones.push(id);
    }

  }

  inSelectedZones(id) {

    for (let i = 0; i < this.selectedZones.length; i++) {
      if (this.selectedZones[i] == id) {
        return true;
      }
    }

    return false;
  }

  updateZones() {
    this.dataService.bleUpdateZones(this.selectedZones);
    this.navCtrl.pop();

  }

}

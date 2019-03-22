import { ZoneSettingsPage } from './../zone-settings/zone-settings';
import { WifiSettingsPage } from './../wifi-settings/wifi-settings';
import { DataServiceProvider } from './../../providers/data-service/data-service';
import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-network-settings',
  templateUrl: 'network-settings.html'
})
export class NetworkSettingsPage {


  deviceStatus = null;
  deviceStatusInterval = null;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private dataService: DataServiceProvider) {

    // Actualizar la interfaz cada 1 segundo
    this.deviceStatus = this.dataService.getDeviceStatus();

    this.deviceStatusInterval = setInterval(() => {
      this.deviceStatus = this.dataService.getDeviceStatus();
    }, 1000);

  }

  ionViewWillLeave() {
    console.log('leaving network page');
    //this.clearStatusInterval();
  }

  toggleSysmosDevice(sysmosStatus) {
    this.dataService.bleToggleSysmosDevice(sysmosStatus);
  }

  toggleWifiNetwork(wifiStatus) {
    this.dataService.bleToggleWifiNetwork(wifiStatus);
  }

  toggleSysmosNetwork(sysmosStatus) {
    this.dataService.bleToggleSysmosNetwork(sysmosStatus);
  }

  openWifiModal() {
    let modal = this.modalCtrl.create(WifiSettingsPage);
    modal.present();
  }

  openZonesModal() {
    let modal = this.modalCtrl.create(ZoneSettingsPage);
    modal.present();
  }

  clearStatusInterval() {
    if (this.deviceStatusInterval !== null) {
      clearInterval(this.deviceStatusInterval);
      this.deviceStatusInterval = null;
    }
  }
}


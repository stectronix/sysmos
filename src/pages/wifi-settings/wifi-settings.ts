import { DataServiceProvider } from './../../providers/data-service/data-service';
import { Component } from '@angular/core';
import { ModalController, Platform, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

/**
 * Generated class for the WifiSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-wifi-settings',
  templateUrl: 'wifi-settings.html',
})
export class WifiSettingsPage {

  network = {
    status: 0,
    ssid: '',
    password: ''
  };

  availableNetworks = [];

  platformUrl = '';

  wifiInterval = null;
  wifiSuccess = false;
  maxWifiAttempts = 10;

  sysmosInterval = null;
  sysmosSuccess = false;
  maxSysmosAttempts = 10;

  deviceStatus = null;
  wifiLoader = null;

  connAlert = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private dataService: DataServiceProvider,
    private toastCtrl: ToastController) {
    this.platformUrl = this.dataService.getPlatformUrl();
    this.deviceStatus = this.dataService.getDeviceStatus();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WifiSettingsPage');
    this.network = JSON.parse(JSON.stringify(this.deviceStatus.network));
    console.log(this.network);
  }

  ionViewWillLeave() {
    this.wipeWifiInterval();
    this.wipeSysmosInterval();
  }

  prepareNetwork(ssid) {
    if (!ssid) {
      return;
    }

    // Si se esta conectado y la red tocada es la misma a conectar, mostrar prompt para desconectar
    if (this.network && this.network.status === 1 && this.network.ssid === ssid) {

      this.connAlert = this.alertCtrl.create({
        title: ssid,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Desconectar',
            handler: data => {
              this.disconnectFromNetwork();
              this.deviceStatus = this.dataService.getDeviceStatus();
            }
          }
        ]
      });

    } else { // Sino, conectar

      this.connAlert = this.alertCtrl.create({
        title: ssid,
        inputs: [
          {
            name: 'password',
            placeholder: 'Contraseña',
            type: 'password'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Conectar',
            handler: data => {

              this.network.ssid = ssid;
              this.network.password = data.password;
              this.connectToNetwork();

            }
          }
        ]
      });

    }

    this.connAlert.present();
  }

  connectToNetwork() {

    if (this.network.ssid.trim() === '' || this.network.password.trim() === '') {
      return;
    }

    // Se envia el comando para conexion wifi y luego se revisa el estado de la misma
    this.wifiSuccess = null;
    this.dataService.connectToNetwork(this.network.ssid.trim(), this.network.password.trim());
    this.checkNetworkConnectivity();
    this.presentLoading();

  }

  checkNetworkConnectivity() {
    this.wipeWifiInterval();

    let wifiAttempts = 0;

    this.wifiInterval = setInterval(() => {
      console.log('wifi interval');

      this.deviceStatus = this.dataService.getDeviceStatus();
      if (this.deviceStatus.network.status === 1) {

        if (this.wifiLoader) {
          this.wifiLoader.dismiss();
        }

        if (this.connAlert !== null) {
          this.connAlert.dismiss();
          this.connAlert = null;
        }

        this.wifiSuccess = true;
        this.sysmosSuccess = null;
        this.checkSysmosConnectivity();

        this.wipeWifiInterval();
      }

      wifiAttempts++;
      if (wifiAttempts >= this.maxWifiAttempts) {

        let toast = this.toastCtrl.create({
          message: 'No se pudo conectar a la red',
          duration: 3000
        });
        toast.present();

        this.wifiSuccess = false;
        this.wipeWifiInterval();
      }
    }, 2000);


  }

  disconnectFromNetwork() {
    this.dataService.connectToNetwork('', '');
  }

  checkSysmosConnectivity() {

    this.wipeSysmosInterval();

    let sysmosAttempts = 0;

    this.sysmosInterval = setInterval(() => {
      console.log('sysmosInterval');
      if (this.deviceStatus.platform.status === 1) {

        this.sysmosSuccess = true;
        this.wipeSysmosInterval();
      }

      sysmosAttempts++;
      if (sysmosAttempts >= this.maxSysmosAttempts) {
        this.sysmosSuccess = false;
        this.wipeSysmosInterval();
      }
    }, 1000);

  }

  wipeWifiInterval() {
    console.log('Wiping wifi Interval!!!!!!!!!!!!!!!!!!!!!!');
    if (this.wifiInterval !== null) {
      console.log('Wipy!');
      clearInterval(this.wifiInterval);
      this.wifiInterval = null;
    }
  }

  wipeSysmosInterval() {
    if (this.sysmosInterval !== null) {
      clearInterval(this.sysmosInterval);
      this.sysmosInterval = null;
    }
  }

  presentLoading() {
    this.wifiLoader = this.loadingCtrl.create({
      content: "Conectando...",
      duration: this.maxWifiAttempts * 1000
    });
    this.wifiLoader.present();
  }

}

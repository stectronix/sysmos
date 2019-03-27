import { DataServiceProvider } from './../../providers/data-service/data-service';
import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-connecting',
  templateUrl: 'connecting.html',
})

/**
 * Esta page es utilizada para controlar la conexion bluetooth
 */
export class ConnectingPage {

  devices: any[] = [];
  bleStatus = 0;
  scanningInterval = null;
  mobilePlatform = 'android';
  constructor(public navCtrl: NavController, public dataService: DataServiceProvider) {
  }

  ionViewDidEnter() {
    this.initializeBle();
  }

  ionViewWillLeave() {
    console.log('leaving connecting page');
    this.clearScanningInterval();
  }

  initializeBle() {
    this.mobilePlatform = this.dataService.getMobilePlatform();
    if (this.mobilePlatform === 'ios') {
      // IOS no tiene buen control de encendido bluetooth
      this.beginScan();

    } else {

      this.dataService.bleIsEnabled().then(
        () => {
          console.log("Bluetooth is enabled");
          this.dataService.bleStatus = 'bluetooth-on';

          // se revisa por conexiones previas en las preferences
          console.log('checking previous connection');
          this.dataService.getPreferences().then(
            (preferences) => {
              console.log('previous connection exists');

              if (preferences) {
                // hay preferencias
                console.log(JSON.stringify(preferences.last_peripheral));

                if (preferences.last_peripheral && preferences.last_peripheral.id) {
                  // preferencia es valida

                  console.log('checking if connected to: ' + preferences.last_peripheral.id);
                  this.dataService.bleIsConnectedTo(preferences.last_peripheral.id).then(
                    (data) => {
                      // aun esta conectado inciar sync
                      console.log('still connected');
                      this.waitForConnection();
                      this.dataService.bleOnConnected(preferences.last_peripheral);
                    },
                    () => {
                      // ya no esta conectado al ultimo dispositivo
                      console.log('no longer connected');

                      this.dataService.bleDisconnectFromDevice(preferences.last_peripheral.id).then(
                        () => {
                          console.log('disconnected from previous device');
                          console.log('resuming connection');
                          this.beginScan();
                        },
                        () => {
                          console.log('failed to disconnect from previous device'); console.log('resuming connection');
                          this.beginScan();
                        },
                      );
                    }
                  );
                } else {
                  // preferencia existente no tiene datos de ultima conexion
                  this.beginScan();
                }
              } else {
                // no habian preferencias sobre conexiones previas
                this.beginScan();
              }
            },
            () => {
              // no habian preferencias sobre conexiones previas
              console.log('no previous connection');
              this.beginScan();
            }
          );

        },
        () => {
          console.log("Bluetooth is *not* enabled");
          this.dataService.bleStatus = 'bluetooth-off';
        }
      );
    }
  }

  enableBluetooth() {
    this.dataService.bleEnable().then(
      () => {
        console.log('Bluetooth enabled');
        this.dataService.bleStatus = 'bluetooth-on';
        this.beginScan();
      },
      () => {
        console.log('Bluetooth couldnt enable');
        this.dataService.bleStatus = 'bluetooth-disabled';
      }
    );
  }

  beginScan() {
    this.clearScanningInterval();
    this.dataService.bleBeginScan();
    this.devices = this.dataService.devices;

    this.waitForConnection();
  }

  waitForConnection() {

    // Se espera que peripheral este conectado para mostrar la app
    this.scanningInterval = setInterval(() => {
      console.log('scanningInterval!');
      if (this.dataService.bleStatus === 'connected') {
        console.log('Moving on!');
        this.clearScanningInterval();
        this.navCtrl.setRoot('Tabs');
      }
    }, 10000);
  }

  deviceSelected(device) {
    this.dataService.bleConnectToDevice(device);
  }

  clearScanningInterval() {
    if (this.scanningInterval !== null) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = null;
    }
  }
}

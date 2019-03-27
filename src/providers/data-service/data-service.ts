import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ToastController, LoadingController } from 'ionic-angular';
import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { Storage } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';

// Sysmos device status charasteristic
const STATUS_SERVICE = 'ed73f59a-ed70-446f-a16e-15dc239938cd';
const STATUS_CHARACTERISTIC = '8f1f517a-c0d5-4468-896c-638487ed8b50';

// Sysmos device save charasteristic
const SAVE_SERVICE = 'ed73f59a-ed70-446f-a16e-15dc239938cd';
const SAVE_CHARACTERISTIC = '8f1f517a-c0d5-4468-896c-638487ed8b50';

//const STATUS_SERVICE = 'fff0';
//const STATUS_CHARACTERISTIC = 'fff4';

@Injectable()
export class DataServiceProvider {

  siteUrl: string = 'http://sysmos.cl';
  mobilePlatform: string = 'android'; // ios o android

  deviceStatus: any = {
    id: 'sys-001',
    version: 1,
    power: 0,

    network: {
      status: 0,
      ssid: '',
      password: ''
    },

    platform: {
      status: 0,
      last_event: {
        date: '',
        richter: 0,
        mercalli: 0
      }
    },

    zones: [],
    alarm: 0
  };

  alarms = [
    null,
    { name: 'Alarma 1', file: 'assets/audios/alarms/default.mp3' },
    { name: 'Alarma 2', file: 'assets/audios/alarms/default.mp3' },
    { name: 'Alarma 3', file: 'assets/audios/alarms/default.mp3' }
  ];

  zones = [
    { id: 15, name: 'Arica y Parinacota' },
    { id: 1, name: 'Tarapacá' },
    { id: 2, name: 'Antofagasta' },
    { id: 3, name: 'Atacama' },
    { id: 4, name: 'Coquimbo' },
    { id: 5, name: 'Valparaíso' },
    { id: 16, name: 'Metropolitana de Santiago' },
    { id: 6, name: 'OHiggins' },
    { id: 7, name: 'Maule' },
    { id: 8, name: 'Biobío' },
    { id: 9, name: 'Araucanía' },
    { id: 14, name: 'Los Ríos' },
    { id: 10, name: 'Los Lagos' },
    { id: 11, name: 'Aysén' },
    { id: 12, name: 'Magallanes' }
  ];



  bleStatus: string;
  scanningInterval: any = null;
  isScanning: boolean = false;
  timeBetweenScans = 9500; // ms
  scansCount = 0;

  devices: any[] = [];
  candidateDevice: any = null; // Desired device to connect
  rssiThreshold = -60;
  peripheral: any = {};

  statusInterval: any = null;
  bleTimeBetweenUpdates: number = 10000; // millis

  bleLoading: any = null;

  socialUrls = {
    'facebook': 'https://www.facebook.com/SysmosChile/',
    'twitter': 'https://twitter.com/sensor_central',
    'website': 'http://sysmos.cl/'
  };

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private ngZone: NgZone,
    private ble: BLE,
    private bluetooth: BluetoothSerial, // bserial es necesario solo por ios
    private storage: Storage,
    private iab: InAppBrowser) {
  }

  setMobilePlatform(platform) {
    this.mobilePlatform = platform;
  }
  getMobilePlatform() {
    return this.mobilePlatform;
  }

  getSiteUrl() {
    return this.siteUrl;
  }

  getPlatformUrl() {
    return this.siteUrl;
  }

  openSocialUrl(socialSlug) {
    this.openUrl(this.socialUrls[socialSlug]);
  }

  openUrl(url) {
    this.iab.create(url, '_system');
  }

  getDeviceStatus() {
    return this.deviceStatus;
  }

  getAlarms() {
    return this.alarms;
  }

  getAvailableZones() {
    return this.zones;
  }

  connectToNetwork(ssid, password) {

    this.bleWriteToDevice('network', {
      status: 0,
      ssid: ssid,
      password: password
    });

    return true;
  }

  bleIsEnabled() {
    console.log(JSON.stringify(this.bluetooth.list()));
    return this.ble.isEnabled();
  }

  bleEnable() {
    return this.bluetooth.enable(); // Se debe hacer por bluetooth y no ble pues ios no soporta enable desde ble
  }

  bleIsConnectedTo(deviceId) {
    return this.ble.isConnected(deviceId);
  }

  bleToggleSysmosDevice(sysmosToggle) {

    this.presentBleLoading();

    this.bleWriteToDevice('status', sysmosToggle === false ? 0 : 1);

    return true;
  }

  bleToggleWifiNetwork(wifiToggle) {

    this.presentBleLoading();

    this.bleWriteToDevice('network', {
      status: wifiToggle === false ? -1 : 0,
      ssid: this.deviceStatus.network.ssid,
      password: this.deviceStatus.network.password
    });

    return true;
  }

  bleToggleSysmosNetwork(sysmosToggle) {

    this.presentBleLoading();

    this.bleWriteToDevice('platform', {
      status: sysmosToggle === false ? -1 : 0,
      last_event: {
        date: this.deviceStatus.platform.date,
        richter: this.deviceStatus.platform.richter,
        mercalli: this.deviceStatus.platform.mercalli
      }
    });

    return true;
  }

  saveAlarm(alarmId) {
    this.presentBleLoading();
    this.bleWriteToDevice('alarm', alarmId);
    return true;
  }

  bleUpdateZones(selectedZones) {
    this.presentBleLoading();
    this.bleWriteToDevice('zones', selectedZones);
    return true;
  }

  /**
   * Actualiza un solo parametro del deviceStatus
   * @param parameter
   * @param value
   */
  bleWriteToDevice(parameter, value) {

    const ds = JSON.parse(JSON.stringify(this.deviceStatus));
    ds[parameter] = value;

    console.log('writing to gatt: ', JSON.stringify(ds));

    this.ble.write(this.peripheral.id, SAVE_SERVICE, SAVE_CHARACTERISTIC, this.stringToBytes(JSON.stringify(ds)))
      .then(
        data => {
          console.log(parameter + ' update sent successfully', data);
        },
        () => {
          console.log(parameter + ' update failed');
        }
      );

  }

  // ASCII only
  stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }











  /**
   * Se inicializa el scan con un intervalo de {timeBetweenScans} millis hasta que una
   * señal BLE sea detectada 3 veces muy cerca del dispositivo
   */
  bleBeginScan() {
    this.bleDestroyScanInterval();
    this.bleStatus = 'searching';

    this.scanningInterval = setInterval(() => {

      if (!this.isScanning) {
        this.bleScan();

        if (this.candidateDevice !== null) {
          // Dispositivo encontrado
          this.bleDestroyScanInterval();
        }
      }

    }, this.timeBetweenScans);
  }


  bleScan() {
    this.isScanning = true;

    // Se realiza scan por 2 segundos
    this.ble.scan([], 10).subscribe(
      device => this.bleOnDeviceDiscovered(device), // Se ejecuta por cada dispositivo encontrado
      error => this.bleScanError(error) // Se ejecuta por cada dispositivo encontrado
    );

    this.isScanning = false;
  }

  /**
   * Se ejecuta por cada dispositivo encontrado
   * @param device
   */
  bleOnDeviceDiscovered(device) {
    // No seguir si ya hay dispositivo seleccionado
    if (this.candidateDevice !== null) {
      return;
    }

    // Si device es un dispositivo SYSMOS, entonces es un candidato a conexion
    if (device.name && device.name.indexOf('SYSMOS') !== -1) {
      this.candidateDevice = device;
    }

    console.log('Descubierto ' + JSON.stringify(device, null, 2));
    // Se agrega dispositivo a lista de candidatos
    let cd = null;
    this.devices.forEach(d => {
      if (d.id === device.id) {
        cd = d;
      }
    });

    if (!cd) {
      this.devices.push(device);
      cd = device;
    }
  }

  // Permiso denegado para conexion
  bleScanError(error) {
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      duration: 5000
    });
    toast.present();
  }

  // Se realiza la conexion al dispositivo candidateDevice

  bleConnectToDevice(device) {
    this.bleStatus = 'connecting';

    // Esperar disponibilidad bluetooth, 5000);
    this.ble.connect(device.id).subscribe(
      peripheral => this.bleOnConnected(peripheral),
      peripheral => this.bleOnDeviceDisconnected(peripheral)
    );
  }

  bleDisconnectFromDevice(deviceId) {
    console.log('disconnecting from ' + deviceId);
    return this.ble.disconnect(deviceId);
  }


  /**
   * Despues que se ha hecho una conexion, se inicializa el proceso de actualizar periodicamente el status
   * @param peripheral
   */
  bleOnConnected(peripheral) {
    console.log(JSON.stringify(peripheral));
    this.bleStatus = 'syncing';

    this.ngZone.run(() => {
      this.peripheral = peripheral;
    });

    // Probar si funciona la caracteristica esperada e inicializar statusUpdate
    this.ble.read(this.peripheral.id, STATUS_SERVICE, STATUS_CHARACTERISTIC).then(
      data => {
        this.bleStatus = 'connected';
        this.savePreferences();
        this.bleBeginStatusUpdate();
      },
      () => {
        this.bleStatus = 'syncing-error';
      }
    );

  }

  bleBeginStatusUpdate() {

    this.bleDestroyStatusInterval();
    this.statusInterval = setInterval(() => this.bleStatusUpdate(), this.bleTimeBetweenUpdates);

  }

  bleDestroyStatusInterval() {

    if (this.statusInterval !== null) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }


  bleStatusUpdate() {

    // Se lee el estado del dispositivo Sysmos
    this.ble.read(this.peripheral.id, STATUS_SERVICE, STATUS_CHARACTERISTIC).then(
      (buffer: ArrayBuffer) => {
        const deviceStatus = String.fromCharCode.apply(null, new Uint8Array(buffer));
        console.log(deviceStatus);
        this.deviceStatus = JSON.parse(deviceStatus);

        //this.deviceStatus = { "id": "sys-001", "version": 1, "power": 100, "network": { "status": 1, "ssid": "GGWPX", "password": "shawarma" }, "available_networks": [{ "id": "MAC1", "ssid": "GGWP1", "signal": 100 }, { "id": "MAC2", "ssid": "GGWP2", "signal": 83 }], "platform": { "status": 1, "last_event": { "date": "03:14 04/04/2018", "richter": 5.4, "mercalli": 5 } }, "alarm": 0 };

        console.log('deviceStatus updated!');
      },
      () => this.bleShowAlert('Error Inesperado', 'No se pudo obtener status')
    );

  }



  /*bleOnStatusRead(buffer: ArrayBuffer) {

    const deviceStatus = String.fromCharCode.apply(null, new Uint8Array(buffer));
    //this.deviceStatus = JSON.parse(deviceStatus);
    this.deviceStatus = { "id": "sys-001", "version": 1, "power": 100, "network": { "status": 1, "ssid": "GGWP", "password": "shawarma" }, "available_networks": [{ "id": "MAC1", "ssid": "GGWP1", "signal": 100 }, { "id": "MAC2", "ssid": "GGWP2", "signal": 83 }], "platform": { "status": 1, "last_event": { "date": "03:14 04/04/2018", "richter": 5.4, "mercalli": 5 } }, "alarm": 0 };
  }*/

  bleOnDeviceDisconnected(peripheral) {
    console.log('Tried to connect, error connecting!!', JSON.stringify(peripheral));
    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000
    });
    toast.present();
    this.bleStatus = 'syncing-error';
  }

  bleDestroyScanInterval() {
    if (this.scanningInterval !== null) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = null;
    }

    this.candidateDevice = null;
    this.devices = [];
  }

  bleShowAlert(title, message) {
    console.log(title, message);
  }

  savePreferences() {
    let preferences = {
      last_peripheral: this.peripheral
    }

    this.storage.set('sysmos_preferences', preferences).then((successData) => {
      console.log("Data Stored");
      console.log(successData);
    });
  }

  getPreferences() {
    return this.storage.get('sysmos_preferences');
  }

  presentBleLoading() {
    this.bleLoading = this.loadingCtrl.create({
      content: "Actualizando...",
      duration: 6000
    });
    this.bleLoading.present();
  }

}

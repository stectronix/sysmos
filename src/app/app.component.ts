import { DataServiceProvider } from './../providers/data-service/data-service';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from "@ionic-native/screen-orientation";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {

  rootPage: any = null;
  loader: any;

  constructor(
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public storage: Storage, private dataService: DataServiceProvider,
    public screenOrientation: ScreenOrientation
  ) {

    this.presentLoading();

    this.platform.ready().then(() => {

      this.dataService.setMobilePlatform(this.platform.is('ios') ? 'ios' : 'android');
      this.screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT);

      this.storage.get('introShown').then((result) => {

        if (result) {
          this.rootPage = 'ConnectingPage';
        } else {
          this.rootPage = 'Intro';
          this.storage.set('introShown', true);
        }

        this.loader.dismiss();

      });

    });

    window.addEventListener('beforeunload', () => {

      if (this.dataService.peripheral && typeof this.dataService.peripheral.id !== 'undefined') {
        this.dataService.bleDisconnectFromDevice(this.dataService.peripheral.id);
      }

    });
  }

  presentLoading() {

    this.loader = this.loadingCtrl.create({
      content: "Cargando..."
    });

    this.loader.present();

  }

}
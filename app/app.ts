import { Component } from '@angular/core';
import { ionicBootstrap, Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { MapPage } from './pages/map/map';
import { ConnectivityService } from './providers/connectivity-service/connectivity-service';
import { LocationTracker } from './providers/location-tracker/location-tracker';

@Component({
   template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {
   rootPage: any = MapPage;
   constructor(public platform: Platform) {
      platform.ready().then(() => {
         StatusBar.styleDefault();
      });
   }
}

ionicBootstrap(MyApp, [ConnectivityService, LocationTracker]);

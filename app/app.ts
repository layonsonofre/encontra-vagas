import { Component } from '@angular/core';
import { ionicBootstrap, Platform, MenuController, NavController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { MapPage } from './pages/map/map';
import { ConnectivityService } from './providers/connectivity-service/connectivity-service';

@Component({
   templateUrl: '<ion-nav [root]="rootPage"></ion-nav>',
   providers: [NavController]
})
export class MyApp {
   @ViewChild('nav') nav: NavController;
   private rootPage: any;
   private pages: any[];
   // rootPage: any = MapPage;

   constructor(public platform: Platform, private menu: MenuController) {
      platform.ready().then(() => {
         StatusBar.styleDefault();
      });
   }
}

ionicBootstrap(MyApp, [ConnectivityService]);

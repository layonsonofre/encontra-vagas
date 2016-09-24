import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConnectivityService } from '../../providers/connectivity-service/connectivity-service';
import { Geolocation } from 'ionic-native';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';

declare var google;

@Component({
  templateUrl: 'build/pages/map/map.html'
, providers: [LocationTracker]
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  mapInitialized: boolean = false;
  apiKey: 'AIzaSyCkEfZWhdZhXmNQevSAK5yubpEOh58RXEs';

  constructor(private navCtrl: NavController, private connectivityService: ConnectivityService, tracker) {
    this.loadGoogleMaps();
    this.tracker = tracker;
  }

  loadGoogleMaps() {
    this.addConnectivityListeners();
    if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
      console.log('Google maps javascript needs to be loaded');
      this.disableMap();

      if (this.connectivityService.isOnline()) {
        console.log("Online, loading map");

        window['mapInit'] = () => {
          this.initMap();
          this.enableMap();
        }

        let script = document.createElement('script');
        script.id = 'googleMaps';

        if (this.apiKey) {
          script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
        } else {
          script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
        }

        document.body.appendChild(script);
      }
    } else {
      if (this.connectivityService.isOnline()) {
        console.log('showing map');
        this.initMap();
        this.enableMap();
      } else {
        console.log('disabling map');
        this.disableMap();
      }
    }
  }

  initMap() {
    this.mapInitialized = true;
    Geolocation.getCurrentPosition().then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    });
    this.start();
  }

  disableMap() {
    console.log('disable map');
  }

  enableMap() {
    console.log('enable map');
  }

  addConnectivityListeners() {
    var me = this;
    var onOnline = () => {
      setTimeout(() => {
        if(typeof google == 'undefined' || typeof google.maps == 'undefined') {
          this.loadGoogleMaps();
        } else {
          if(!this.mapInitialized) {
            this.initMap();
          }

          this.enableMap();
        }
      }, 2000);
    };

    var onOffline = () => {
      this.disableMap();
    };

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
  }

  static get parameters() {
    return [[LocationTracker]];
  }

  start() {
    this.tracker.startTracking().subscribe((position) => {
      console.log(position);
    })
  }

  stop() {
    this.tracker.stopTracking();
  }


}

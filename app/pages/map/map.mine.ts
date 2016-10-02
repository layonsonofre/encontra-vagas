import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConnectivityService } from '../../providers/connectivity-service/connectivity-service';
import { Geolocation } from 'ionic-native';
import { VagasService } from '../../providers/vagas-service/vagas-service';

declare var google;

@Component({
   templateUrl: 'build/pages/map/map.html'
   , providers: [VagasService]
})
export class MapPage {

   @ViewChild('map') mapElement: ElementRef;
   private map: any;
   private mapInitialized: boolean = false;
   private apiKey: string = 'AIzaSyCkEfZWhdZhXmNQevSAK5yubpEOh58RXEs';
   private vagas: any;
   private myPosition: any; //= new google.maps.LatLng(-25.0873569, -50.1691468);

   constructor(private navCtrl: NavController, private connectivityService: ConnectivityService, private vagasService: VagasService) {
      this.loadGoogleMaps();
   }

   whereAmI() {
      let id = navigator.geolocation.watchPosition((position) => {
         this.myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
         this.addMarker(this.myPosition);
         this.loadMarkers();
      }, (err) => {
         console.log('Error watching position: ' + err.code + ' ' + err.message);
      }, {
         timeout: 3000,
         enableHighAccuracy: true,
         maximumAge: 0
      });
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

            if (this.apiKey !== undefined) {
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
      navigator.geolocation.getCurrentPosition((position) => {
         this.myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      });

      let mapOptions = {
         center: this.myPosition,
         zoom: 15,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.whereAmI();
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
            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
               this.loadGoogleMaps();
            } else {
               if (!this.mapInitialized) {
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

   loadMarkers() {
      this.vagasService.load()
         .then(data => {
         this.vagas = data;
         this.vagas.forEach((vaga) => {
            let latLng = new google.maps.LatLng(vaga.latitude, vaga.longitude);
            let marker = this.addMarker(latLng);
            this.addInfoWindow(marker, '<h4>;)</h4>');
         });
      });

   }

   addMarker(location) {
      let marker = new google.maps.Marker({
         map: this.map,
         animation: google.maps.Animation.DROP,
         position: location === undefined ? this.map.getCenter() : location
      });
      return marker;
   }

   addInfoWindow(marker, content) {
      let infoWindow = new google.maps.InfoWindow({
         content: content
      });
      google.maps.event.addListener(marker, 'click', () => {
         infoWindow.open(this.map, marker);
      });
   }
}

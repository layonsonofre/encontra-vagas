import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, Button, List, Item } from 'ionic-angular';
import { ConnectivityService } from '../../providers/connectivity-service/connectivity-service';
import { Geolocation } from 'ionic-native';
import { VagasService } from '../../providers/vagas-service/vagas-service';
// import { Button, List, Item } from 'ionic/ionic';

declare var google, vagaSelecionada;

@Component({
   templateUrl: 'build/pages/map/map.html'
   , providers: [VagasService]
   , directives: [Button, List, Item]
})
export class MapPage {

   @ViewChild('map') mapElement: ElementRef;

   private map: any;
   private mapInitialised: boolean = false;
   private apiKey: string = 'AIzaSyCkEfZWhdZhXmNQevSAK5yubpEOh58RXEs';
   private markers = [];
   private vagas: any;

   private myPosition: any;
   private myMarker = null;

   private directionsService: any;
   private directionsDisplay: any;
   public stepsTo: any = null;

   constructor(private nav: NavController, private connectivityService: ConnectivityService, private vagasService: VagasService) {
      this.loadGoogleMaps();
   }

   loadGoogleMaps() {
      this.addConnectivityListeners();
      if (typeof google == "undefined" || typeof google.maps == "undefined") {
         console.log("Google maps JavaScript needs to be loaded.");
         this.disableMap();

         if (this.connectivityService.isOnline()) {
            console.log("online, loading map");

            window['mapInit'] = () => {
               this.initMap();
               this.enableMap();
            }

            let script = document.createElement("script");
            script.id = "googleMaps";
            if (this.apiKey) {
               script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&language=pt-BR&callback=mapInit';
            } else {
               script.src = 'http://maps.google.com/maps/api/js?language=pt-BR&callback=mapInit';
            }
            document.body.appendChild(script);
         }
      } else {
         if (this.connectivityService.isOnline()) {
            console.log("showing map");
            this.initMap();
            this.enableMap();
         }
         else {
            console.log("disabling map");
            this.disableMap();
         }
      }
   }

   initMap() {
      this.mapInitialised = true;

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition((position) => {
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            let mapOptions = {
               center: latLng,
               zoom: 15,
               mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

            this.directionsService = new google.maps.DirectionsService();
            this.directionsDisplay = new google.maps.DirectionsRenderer();
            this.directionsDisplay.setMap(this.map);

            this.whereAmI();
            this.loadVagas();
         }, () => {
            this.handleNavigatorError(true);
         });
      } else {
         this.handleNavigatorError(false);
      }
   }

   disableMap() {
      console.log("disable map");
      //imagem de fundo
   }

   enableMap() {
      console.log("enable map");
      //imagem de fundo
   }

   addConnectivityListeners() {
      var me = this;

      var onOnline = () => {
         setTimeout(() => {
            if (typeof google == "undefined" || typeof google.maps == "undefined") {
               this.loadGoogleMaps();
            } else {
               if (!this.mapInitialised) {
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

   whereAmI() {
      let id = navigator.geolocation.watchPosition((position) => {
         this.myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
         this.addMarker(true, this.myPosition, 0);
      }, (err) => {
            console.log('Error watching position: ' + err.code + ' ' + err.message);
         }, {
            timeout: 3000,
            enableHighAccuracy: true,
            maximumAge: 0
         });
   }

   loadVagas() {
      this.clearMarkers();
      console.log('Loading vagas...');
      this.vagasService.load().then(data => {
         this.vagas = data;

         for (let i = 0; i < this.vagas.length; i++) {
            let latLng = new google.maps.LatLng(this.vagas[i].latitude, this.vagas[i].longitude);
            this.addMarker(false, latLng, i * 200);
         }
      });
   }

   clearMarkers() {
      for (let i = 0; i < this.markers.length; i++) {
         this.markers[i].setMap(null);
      }
      this.markers = [];
   }

   addMarker(me, location, timeout) {
      if (me && this.myMarker !== null) {
         this.myMarker.setMap(null);
         this.myMarker = null;
      }
      window.setTimeout(() => {
         var marker = null;
         if (me) {
            marker = new google.maps.Marker({
               map: this.map,
               draggable: false,
               animation: null,
               position: location
            });
         } else {
            marker = new google.maps.Marker({
               map: this.map,
               draggable: false,
               animation: google.maps.Animation.DROP,
               position: location
            });
         }
         google.maps.event.addListener(marker, 'click', () => {
            if (marker.getAnimation() != null) {
               marker.setAnimation(null);
               this.directionsDisplay.setDirections({ routes: [] });
               this.stepsTo = null;
            } else {
               marker.setAnimation(google.maps.Animation.BOUNCE);
               this.calculateAndDisplayRoute(marker);
            }
         });
         if (me === false) {
            this.markers.push(marker);
         } else {
            this.myMarker = marker;
         }
      }, timeout);
   }

   handleNavigatorError(browserHasGeolocation) {
      console.log(browserHasGeolocation ?
         'Error: The Geolocation service failed.' :
         'Error: Your browser doesn\'t support geolocation.');
   }

   calculateAndDisplayRoute(marker) {
      if (this.mapInitialised && marker.getPosition() !== this.myMarker.getPosition()) {
         this.directionsDisplay.setDirections({ routes: [] });
         this.stepsTo = null;
         this.directionsService.route({
            origin: this.myPosition,
            destination: marker.getPosition(),
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC
         }, (response, status) => {
            if (status === 'OK') {
               this.directionsDisplay.setDirections(response);
               this.stepsTo = response.routes[0].legs[0];
            } else {
               console.log('Directions request failed due to ' + status);
            }
         });
      }
   }

   // addInfoWindow(marker, content) {
   //    let infoWindow = new google.maps.InfoWindow({
   //       content: content
   //    });
   //    google.maps.event.addListener(marker, 'click', () => {
   //       infoWindow.open(this.map, marker);
   //    });
   // }

}

import { Injectable } from '@angular/core';
import { Geolocation } from 'ionic-native';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LocationTracker {

  constructor() {
    this.positionObserver = null;
    this.position = Observable.create(observer => {
      this.positionObserver = observer;
    });
  }

  startTracking() {
    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = Geolocation.watchPosition(options);

    this.watch.subscribe((data) => {
      this.notifyLocation(data.coords);
    });

    let backgroundOptions = {
      desiredAccuracy: 10,
      stationaryRadius: 10,
      distanceFilter: 30
    };

    backgroundGeolocation.configure((location) => {
      this.notifyLocation(location);
    }, (err) => {
      console.log(err);
    }, backgroundOptions);

    backgroundGeolocation.start();
    return this.position;
  }

  stopTracking() {
    backgroundGeolocation.finish();
    this.watch.unsubscribe();
  }

  notifyLocation(location) {
    this.positionObserver.next(location);
  }
}

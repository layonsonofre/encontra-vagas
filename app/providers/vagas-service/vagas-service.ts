import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class VagasService {
   public vagas: any;
   constructor(private http: Http) {
   }

   load() {
      return new Promise(resolve => {
         this.http.get('http://ejec.co/layon/vagas/api.php')
            .map(res => res.json())
            .subscribe(data => {
               this.vagas = data;
               resolve(this.vagas);
            }, err => {
               console.error(err);
            });
      });
   }
}

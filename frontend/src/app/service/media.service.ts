import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

export interface MediaEntry {
  id: number;
  isTv: boolean;
}

export interface StateMedia {
  [key: string]: {
    media: MediaEntry[];
  };
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private jsonUrl = `assets/motion-pictures-states.json`;
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async loadJson(): Promise<StateMedia> {
    return await firstValueFrom(this.http.get<StateMedia>(this.jsonUrl));
  }

  getMediaPiece(id: number | string, isTv: boolean) {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('isTv', isTv.toString());
    return this.http.get(`${this.apiUrl}/api/get-media`, { params });
  }
}

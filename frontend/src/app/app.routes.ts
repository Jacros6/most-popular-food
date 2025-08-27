import { Routes } from '@angular/router';
import { HomeComponent } from './routes/home/home.component';
import { StatesComponent } from './routes/states/states.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'states', 
        component: StatesComponent
    },
    {
        path: '**', redirectTo: '', pathMatch: 'full'
    }
];

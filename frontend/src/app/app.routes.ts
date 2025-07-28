import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { AddExpense } from './add-expense/add-expense';
import { Profile } from './profile/profile';
import { Settings } from './settings/settings';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'add', component: AddExpense },
  { path: 'profile', component: Profile },
  { path: 'settings', component: Settings },
];

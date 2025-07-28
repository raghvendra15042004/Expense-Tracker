import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { DataService } from './data.service';
import { FooterComponent } from "./footer/footer"; // ✅ import the service


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private dataService = inject(DataService); // ✅ inject service

  protected readonly title = 'Expense Tracker';

  constructor() {
    // this.dataService.loadData(); // ✅ load data.json on app start
  }
}

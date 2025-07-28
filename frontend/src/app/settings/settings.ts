import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './settings.html',
})
export class Settings {
  dataService = inject(DataService);
  newCategory = signal('');

  constructor() {
    this.dataService.loadCategories(); // Load once
  }

  addCategory() {
    const title = this.newCategory().trim();
    if (!title) return;

    this.dataService.addCategory(title).subscribe({
      next: () => {
        this.newCategory.set('');
        this.dataService.loadCategories(); // Refresh list
      },
      error: err => alert(err.error.detail || 'Failed to add category'),
    });
  }

  deleteCategory(title: string) {
    this.dataService.deleteCategory(title).subscribe({
      next: () => this.dataService.loadCategories(),
      error: err => alert(err.error.detail || 'Failed to delete category'),
    });
  }
}

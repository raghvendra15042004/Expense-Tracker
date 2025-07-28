import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './add-expense.html',
})
export class AddExpense {
  dataService = inject(DataService);

  desc = '';
  amount: number | null = null;
  date = '';
  category = '';

  constructor() {
    this.dataService.loadCategories(); // Load categories for dropdown
  }

  addExpense() {
    const expense = {
      desc: this.desc.trim(),
      amount: this.amount,
      date: new Date(this.date).toISOString(),
      category: this.category || undefined,
    };

    if (!expense.desc || !expense.amount || !expense.date) {
      alert('Please fill all required fields');
      return;
    }

    this.dataService.addExpense(expense).subscribe({
      next: () => {
        alert('Expense added');
        this.desc = '';
        this.amount = null;
        this.date = '';
        this.category = '';
      },
      error: err => alert(err.error.detail || 'Failed to add expense'),
    });
  }
}

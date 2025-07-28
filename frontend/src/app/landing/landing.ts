import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon'; // ✅ Correct import

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, MatIconModule], // ✅ Fixed here
  templateUrl: './landing.html',
})
export class Landing {
  dataService = inject(DataService);

  constructor() {
    this.dataService.loadExpenses();
  }

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  monthlyTotal = computed(() =>
    this.dataService.expenses().reduce((sum, exp) => {
      const d = new Date(exp.date);
      return d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear
        ? sum + exp.amount
        : sum;
    }, 0)
  );

  annualTotal = computed(() =>
    this.dataService.expenses().reduce((sum, exp) => {
      const d = new Date(exp.date);
      return d.getFullYear() === this.currentYear ? sum + exp.amount : sum;
    }, 0)
  );

  currentPage = 1;
  pageSize = 5;

  get paginatedExpenses() {
    const all = this.dataService.expenses();
    const start = (this.currentPage - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize); // ✅ not a function
  }

  get totalPages() {
    return Math.ceil(this.dataService.expenses().length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  deleteExpense(id: string) {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.dataService.deleteExpense(id).subscribe({
        next: () => this.dataService.loadExpenses(),
        error: err => alert(err.error.detail || 'Failed to delete expense'),
      });
    }
  }
}

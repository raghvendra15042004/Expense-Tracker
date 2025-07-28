import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class DataService {
  private baseUrl = 'http://localhost:8000'; // FastAPI backend URL

  expenses = signal<any[]>([]);
  categories = signal<string[]>([]);
  profile = signal<any>(null);  // ✅ Added signal for profile

  constructor(private http: HttpClient) {}

  // Expenses
  loadExpenses() {
    this.http.get<any[]>(`${this.baseUrl}/expenses`).subscribe(data => {
      this.expenses.set(data);
    });
  }

  addExpense(expense: any) {
    return this.http.post(`${this.baseUrl}/expenses`, expense);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // Categories
  loadCategories() {
    this.http.get<any[]>(`${this.baseUrl}/categories`).subscribe(data => {
      this.categories.set(data.map(c => c.title));
    });
  }

  addCategory(category: string) {
    return this.http.post(`${this.baseUrl}/categories`, { title: category });
  }

  deleteCategory(title: string) {
    return this.http.delete(`${this.baseUrl}/categories/${title}`);
  }

  // ✅ Profile
  loadProfile() {
    this.http.get(`${this.baseUrl}/profile`).subscribe({
      next: (data) => this.profile.set(data),
      error: () => console.warn('No profile found.'),
    });
  }



  saveProfile(profileData: any) {
    return this.http.post(`${this.baseUrl}/profile`, profileData);
  }


  availableBalance = computed(() => {
    const prof = this.profile();
    const exp = this.expenses();

    if (!prof) return 0;

    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const lastMonthExpenses = exp
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return prof.totalBudget - lastMonthExpenses;
  });
}

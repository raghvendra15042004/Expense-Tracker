import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
})
export class Profile {
  public dataService = inject(DataService);

  user1 = {
    name: '',
    email: '',
    avatar: '',
    totalBudget: 0,
  };

  editMode = signal(false); // ✅ Start in view mode by default

  ngOnInit() {
    this.dataService.loadProfile();

    effect(() => {
      const profile = this.dataService.profile();

      if (profile && profile.name) {
        this.user1 = { ...profile };
        this.editMode.set(false); // ✅ Profile exists: show view mode
      } else {
        this.editMode.set(true); // ✅ No profile: enter edit mode
      }
    });
  }

  save() {
    this.dataService.saveProfile(this.user1).subscribe(() => {
      alert('Profile saved!');
      this.editMode.set(false); // switch to view mode after save
    });
  }

  toggleEdit() {
    this.editMode.set(true); // show edit form
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { RoleService } from '../../services/role.service';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [Menubar, ButtonModule, RouterLink],
  templateUrl: './appbar.component.html',
  styleUrl: './appbar.component.css',
})
export class AppbarComponent implements OnInit {
  routes: MenuItem[] = [];
  roleService = inject(RoleService);
  username: string | null = null;

  ngOnInit() {
    this.username = sessionStorage.getItem('username');
    this.routes = [
      {
        path: '/home',
        label: 'Home',
      },
      {
        path: this.roleService.isAdmin() ? '/teacherChat' : '/studentChat',
        label: 'Chat',
      },
      {
        path: '/feedbackChat',
        label: 'Feedback',
      },
      {
        path: '/records',
        label: 'Records',
      },
      {
        path: this.roleService.isAdmin() ? '/admin' : '/user',
        label: 'PersonalArea',
      },
    ].map((route) => ({
      ...route,
      icon: this.getIcon(route.label),
    }));
  }

  private getIcon = (label: string) => {
    const mapIcons = {
      Home: 'pi pi-home',
      Chat: 'pi pi-comments',
      Upload: 'pi pi-cloud-upload',
      Feedback: 'pi pi-thumbs-up',
      PersonalArea: 'pi pi-user',
      Records: 'pi pi-list',
    };
    return (mapIcons as any)[label] || 'pi pi-circle';
  };
}

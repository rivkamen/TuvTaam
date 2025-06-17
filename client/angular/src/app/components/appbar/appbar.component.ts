import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { RoleService } from '../../services/role.service';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [Menubar, ButtonModule, RouterLink, DecimalPipe],
  templateUrl: './appbar.component.html',
  styleUrl: './appbar.component.css',
})
export class AppbarComponent implements OnInit {
  private authService = inject(AuthService);
  roleService = inject(RoleService);
  routes: MenuItem[] = [];
  dueDate = this.authService.user?.dueDate ?? new Date('06-18-2025');
  days = this.dueDate
    ? Math.ceil(
        (this.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  ngOnInit() {
    const routes = [
      {
        path: '/home',
        label: 'Home',
      },
      {
        path: '/feedbackChat',
        label: 'Feedback Chat',
      },
      {
        path: '/records',
        label: 'Records',
      },
      {
        path: this.roleService.isAdmin() ? '/admin' : '/user',
        label: 'PersonalArea',
      },
    ];
    if (this.roleService.isUser()) {
      routes.splice(1, 0, {
        path: '/my-parasha',
        label: 'MyParasha',
      });
    }

    this.routes = routes.map((route) => ({
      ...route,
      icon: this.getIcon(route.label),
    }));
  }

  private getIcon = (label: string) => {
    const mapIcons = {
      Home: 'pi pi-home',
      'Feedback Chat': 'pi pi-comments',
      Upload: 'pi pi-cloud-upload',
      PersonalArea: 'pi pi-user',
      Records: 'pi pi-list',
      MyParasha: 'pi pi-book',
    };
    return (mapIcons as any)[label] || 'pi pi-circle';
  };
}

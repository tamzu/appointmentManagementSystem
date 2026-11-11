import { Routes } from '@angular/router';

import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { CustomerLayout } from './layouts/customer-layout/customer-layout';

import { BranchSelection } from './features/customer-booking/branch-selection/branch-selection.component';
import { ServiceSelection } from './features/customer-booking/service-selection/service-selection.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AccessDenied } from './features/administration/access-denied/access-denied.component';
// import { Dashboard } from './features/administration/dashboard/dashboard.component';
import { AppointmentDetails } from './features/administration/appointment-details/appointment-details.component';
import { Appointments } from './features/administration/appointments/appointments';
import { BranchClosures } from './features/administration/branch-closures/branch-closures.component';
import { BranchServices } from './features/administration/branch-services/branch-services.component';
import { Branches } from './features/administration/branches/branches.component';
import { Dashboard } from './features/administration/dashboard/dashboard';
import { Login } from './features/administration/login/login.component';
import { OperatingHours } from './features/administration/operating-hours/operating-hours.component';
import { Services } from './features/administration/services/services.component';
import { SlotsComponent } from './features/administration/slots/slots.component';
import { BookingConfirmation } from './features/customer-booking/booking-confirmation/booking-confirmation';
import { CustomerDetails } from './features/customer-booking/customer-details/customer-details.component';
import { SlotSelection } from './features/customer-booking/slot-selection/slot-selection.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'booking',
    pathMatch: 'full',
  },
  {
    path: 'booking',
    component: CustomerLayout,
    children: [
      {
        path: '',
        redirectTo: 'branches',
        pathMatch: 'full',
      },
      {
        path: 'branches',
        component: BranchSelection,
      },
      {
        path: 'services',
        component: ServiceSelection,
      },
      {
        path: 'slots',
        component: SlotSelection,
      },
      { path: 'customer-details', component: CustomerDetails },
      { path: 'confirmation', component: BookingConfirmation },
    ],
  },
  {
    path: 'admin/login',
    component: Login,
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'access-denied',
        component: AccessDenied,
      },
      {
        path: '',
        component: Dashboard,
        canActivate: [roleGuard],
        data: {
          roles: ['Admin'],
        },
      },
      {
        path: 'branch-services',
        component: BranchServices,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'appointments',
        component: Appointments,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'appointments/:appointmentId',
        component: AppointmentDetails,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'branches',
        component: Branches,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'operating-hours',
        component: OperatingHours,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'branch-closures',
        component: BranchClosures,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'services',
        component: Services,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
      {
        path: 'slots',
        component: SlotsComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Staff'] },
      },
    ],
  },
  //   {
  //   path: 'appointments',
  //   component: Appointments,
  //   canActivate: [roleGuard],
  //   data: {
  //     roles: ['Admin', 'Staff'],
  //   },
  // },
  // {
  //   path: 'branches',
  //   component: Branches,
  //   canActivate: [roleGuard],
  //   data: {
  //     roles: ['Admin'],
  //   },
  // },
  {
    path: '**',
    redirectTo: 'booking',
  },
];

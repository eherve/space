import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SafePipeModule } from 'safe-pipe';

import { HomePage } from './home.page';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [HomePage],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: HomePage }
    ]),
    FlexLayoutModule,
    MatIconModule,
    SafePipeModule
  ]
})
export class HomeModule { }

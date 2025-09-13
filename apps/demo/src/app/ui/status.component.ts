import { CommonModule } from '@angular/common';
import { Component, input, ResourceStatus } from '@angular/core';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch(status()) { @case ('idle') {
    <span class="badge-container">
      <span class="status-emoji">🛌</span>
      <span class="badge badge-gray">Idle</span>
    </span>
    } @case ('error') {
    <span class="badge-container">
      <span class="status-emoji error">❌</span>
      <span class="badge badge-red">Error</span>
    </span>
    } @case ('loading') {
    <span class="badge-container">
      <span class="status-emoji loading">⏳</span>
      <span class="badge badge-orange">Loading</span>
    </span>
    } @case ('reloading') {
    <span class="badge-container">
      <span class="status-emoji loading">🔄</span>
      <span class="badge badge-orange">Reloading</span>
    </span>
    } @case ('resolved') {
    <span class="badge-container">
      <span class="status-emoji success">✅</span>
      <span class="badge badge-green">Loaded</span>
    </span>
    } @case ('local') {
    <span class="badge-container">
      <span class="status-emoji">📦</span>
      <span class="badge badge-blue">Local</span>
    </span>
    } @default {
    <span class="badge-container">
      <span class="status-emoji">-</span>
      <span class="badge badge-darkgray">-</span>
    </span>
    } }
  `,
})
export class StatusComponent {
  readonly status = input.required<ResourceStatus>();
}

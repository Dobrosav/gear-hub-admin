import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IssueStatus } from '../../models/issue.model';
import { DataService } from '../../services/data.service';

export interface IssueRowView {
  id: string;
  displayId: string;
  equipmentName: string;
  reporterName: string;
  description: string;
  attachmentName: string;
  status: IssueStatus;
  statusLabel: string;
  statusClass: string;
  actionLabel: string;
  actionRoute: string[];
}

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.css',
})
export class IssueListComponent implements OnInit {
  private readonly dataService = inject(DataService);

  rows: IssueRowView[] = [];

  ngOnInit(): void {
    const issues = this.dataService.getIssues();

    this.rows = issues.map((issue) => {
      const eq = this.dataService.getEquipmentById(issue.equipmentId);
      const reporter = this.dataService.getUserById(issue.reportedByUserId);
      const photoParts = issue.photoUrl.split('/');
      const attachmentName = photoParts[photoParts.length - 1] ?? issue.photoUrl;

      let statusLabel = 'Novo';
      let statusClass = 'status-danger';
      if (issue.status === 'IN_PROGRESS') {
        statusLabel = 'U obradi';
        statusClass = 'status-maintenance';
      } else if (issue.status === 'RESOLVED') {
        statusLabel = 'Rešeno';
        statusClass = 'status-available';
      }

      const isResolved = issue.status === 'RESOLVED';

      return {
        id: issue.id,
        displayId: issue.id.toUpperCase(),
        equipmentName: eq ? eq.name : issue.equipmentId,
        reporterName: reporter ? `${reporter.firstName} ${reporter.lastName}` : issue.reportedByUserId,
        description: issue.description,
        attachmentName,
        status: issue.status,
        statusLabel,
        statusClass,
        actionLabel: isResolved ? 'Katalog' : 'Obradi prijavu',
        actionRoute: isResolved ? ['/equipment'] : ['/issues', issue.id],
      };
    });
  }
}

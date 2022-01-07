import { Component, OnInit, ViewChild } from '@angular/core';
import { MiaConfirmModalComponent, MiaConfirmModalConfig } from '@agencycoda/mia-core';
import { MiaTableComponent, MiaTableConfig } from '@agencycoda/mia-table';
import { ClientService } from '../../services/client.service';
import { MiaField, MiaFormConfig, MiaFormModalComponent, MiaFormModalConfig } from '@agencycoda/mia-form';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Client } from '../../entities/client';

@Component({
  selector: 'app-clients-table',
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss']
})
export class ClientsTableComponent implements OnInit {

  @ViewChild('clientsTable') clientsTable!: MiaTableComponent;

  tableConfig: MiaTableConfig = new MiaTableConfig();
  miaFormConfig = new MiaFormConfig();
  miaFormModalConfig = new MiaFormModalConfig();

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog
  ) {
    this.miaFormConfig = {
      ...this.miaFormConfig,
      hasSubmit: false,
      fields: [
        {
          key: 'firstname', type: MiaField.TYPE_STRING, label: 'Name', validators: [Validators.required]
        },
        {
          key: 'lastname', type: MiaField.TYPE_STRING, label: 'Surname', validators: [Validators.required]
        },
        {
          key: 'email', type: MiaField.TYPE_STRING, label: 'Email', validators: [Validators.required, Validators.email]
        },
      ],
      errorMessages: [
        { key: 'required', message: '"%label%" is required.' },
        { key: 'email', message: 'Invalid Email' }
      ]
    };

    this.miaFormModalConfig = {
      ...this.miaFormModalConfig,
      service: this.clientService,
      item: new Client(),
      titleNew: 'Create Client',
      titleEdit: 'Create Edit',
      config: this.miaFormConfig
    }

    this.tableConfig = {
      ...this.tableConfig,
      service: this.clientService,
      id: 'clients-table',
      columns: [
        { key: 'selection', type: 'selection', title: '' },
        {
          key: 'firstname', type: 'user', title: 'Name', extra: {
            field_firstname: 'firstname'
          }
        },
        {
          key: 'lastname', type: 'user', title: 'Surname', extra: {
            field_lastname: 'lastname'
          }
        },
        { key: 'email', type: 'string', title: 'Email', field_key: 'email' },
        {
          key: 'more', type: 'more', title: '', extra: {
            actions: [
              { icon: 'create', title: 'Edit', key: 'edit' },
              { icon: 'delete', title: 'Delete', key: 'remove' },
            ]
          }
        },
      ],
      loadingColor: 'blue',
      hasEmptyScreen: true,
      emptyScreenTitle: 'You do not have any item loaded yet',
    };

    this.tableConfig.onClick.subscribe(result => {
      if (result.key === 'edit') {
        this.openClientModal(result.item as Client);
      }

      if (result.key === 'remove') {
        this.openDeleteConfirmModal(result.item as Client);
      }
    });
  }

  ngOnInit(): void {
  }

  openClientModal(client?: Client) {
    this.miaFormModalConfig.item = client ? client : new Client();
    this.dialog.open(MiaFormModalComponent, {
      width: '520px',
      panelClass: 'modal-full-width-mobile',
      data: this.miaFormModalConfig
    }).afterClosed().subscribe(result => {
      if (!!result) {
        this.clientsTable.loadItems();
      }
    });
  }

  openDeleteConfirmModal(client: Client) {
    this.dialog.open(MiaConfirmModalComponent, {
      width: '520px',
      panelClass: 'modal-full-width-mobile',
      data: {
        title: 'Confirm',
        caption: 'Are you sure?',
        buttons: [
          { title: "No", value: 'no' },
          { title: "Yes", value: 'yes' },
        ]
      } as MiaConfirmModalConfig
    }).afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.clientsTable.setStartLoading();
        this.clientService.deleteClient(client).subscribe(resp => {
          if (resp) {
            this.clientsTable.loadItems();
          }
        });
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import '../../shared/rxjs.operators';

// Interfaces
import { Organization } from '../../interfaces/organization';
// Services
import { DataService } from '../../shared/services/data.service';

// Components
import { TableComponent } from '../../shared/table/table.component';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})

export class OrganizationListComponent implements OnInit {
  /**
   * @readonly An Object type property. Basically, it provides column labels and their
   * respective shown values (strings) on runtime. It's a required property in order to let Table Child Component be created.
   * @prop `columns.all`
   * an Array of all possible columns of the table data we are supposed to fetch and load.
   * @prop `columns.visible`
   * an Array of selected columns to be shown in the Table Child Component.
   */
  readonly columns = {
    all: [
      { label: 'order',         value: '#' },
      { label: 'orgId',         value: 'org. number' },
      { label: 'name',          value: 'name' },
      { label: 'address',       value: 'address' },
      { label: 'billing',       value: 'bank account' },
      { label: 'person',        value: 'contact person' },
      { label: 'phone',         value: 'contact phone' },
      { label: 'email',         value: 'contact email' },
      { label: 'description',   value: 'about' }
    ],
    visible: ['order', 'name', 'orgId', 'billing', 'address', 'person', 'email']
  };

  /**
   * @property The table data for the component itself. It's strong-typed to `Organization` interface and is predefined
   * as an empty array of `Organization`. Later on, it's value changes when we subscribe to an Observable method from
   * the service associated with this component.
   *
   * The property name is reflected as an `Input()` on the Table Child Compoment so it's recommended not to change it.
   */
  public tableData: Organization[] = [];
  /**
   * @property An empty Array of `any` type. It stands to collect garbabe possible/unpredictable errors in the component.
   */
  public errors: any[] = [];

  /**
   * @property Function to initialize starting code for the component itself.
   * It consists of many steps like subscribing to a method in the service instantiated by the contructor
   * and then process it's result further.
   */
  initDataLoad: Function = (): void => {
    if (this._dataService) {
      this._dataService.getOrganizations().subscribe(
        organizations => {
          if (organizations && organizations.length > 0) {
            this.tableData = organizations;
          }
        },
        error => this.errors.push(error)
      );
    }
  }

  ngOnInit() {
    if (this.initDataLoad) {
      this.initDataLoad();
    }
  }

  constructor(private _dataService: DataService) { }
}

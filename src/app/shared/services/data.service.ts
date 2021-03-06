import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import '../rxjs.operators';

// Interfaces
import { Organization } from '../../interfaces/organization';
import { Project } from '../../interfaces/project';
import { Activity } from '../../interfaces/activity';
import { Subject, BehaviorSubject } from 'rxjs/Rx';

import { testData } from '../../admin/test-data';
import { environment } from '../../../environments/environment';

/**
 * The data service of the App, resides in the shared module, and responsible for reading and saving JSON data
 * to the backend.
 *
 * @export
 * @class DataService
 */
@Injectable()
export class DataService {
  /**
   * @property
   * `_paths` is an JS Object that enables the user a segmented view of _paths/links,
   * where `root` must always be supplied in conjuction with another property.
   *
   * E.g.: `this._paths.root` + `this._paths.anyOtherProperty`, where the latter is one of the predefined
   * properties of the `_paths`.
   */
  private _paths = {
    root: 'http://18.221.31.52:8080/nano.se/api/',
    organizations: 'organisations/',
    organisationsbyId: 'organisations/',

    projects: 'projects/',
    projectById: 'projects/',
    projectByProjectId: 'projects/number/',
    saveproject: 'projects/',

    activities: 'events/',

  };

  /**
   * @property Used to pass stored data from one parent component to a router outlet inside it.
   */
  private _project: Subject<Object> = new BehaviorSubject<Object>({});
  /**
   * @property Subscribable property in order to provide previously stored relevant private property from a parent component.
   */
  project: Observable<Object> = this._project.asObservable();

  /**
   * @property Function to set the private property `_project`. User must supply `data` as an object of unspecified properties
   * to set a private property so that it can be accessible by another router outlet by subcribing to it later.
   */
  storeProject: Function = (data: Object) => {
    this._project.next(data);
  }


  /**
   * Function that retrieves data from an API (or a string path) with HttpClient GET method.
   * It provides both parameterized and non-parameterized call methods depending on what use provide.
   *
   *
   * @argument path as a string e.g. (API) `'/someurlsegment/api/'` or (file) `'/somepath/somefile.json'`
   * @argument options as JS Object as optional
   * E.g. `{ id: 1 }` or multiple properties `{ name: 'someName', 'date': '2018/01/01' }`
   *
   * Function that retrieves data from an API (or a string path) with HttpClient GET method.
   * It provides both parameterized and non-parameterized call methods depending on what use provide.
   * @returns an `Observable` of any depending on where or what API was provided in the request.
   */
  private _get(path: string, options?: Object): Observable<any> {
    if (path === undefined) {
      return;
    }

    // tslint:disable-next-line:prefer-const
    let _params = new HttpParams();

    if (options !== undefined && Object.keys(options).length > 0) {
      for (const option in options) {
        if (options.hasOwnProperty(option)) {
          _params.set(option, options[option]);
        }
      }
    }

    // Even if the `params` is blank/unset it will still execute a clean Http GET call.
    return this.http.get(path, { params: _params })
    .do((data: Response) => {
      return data !== undefined ? data : [];
    })
    .catch((error: Response) => {
      return Observable.throw(error || 'Server error');
    });
  }


  /**
   * Post a json object to the backend
   *
   * @param {string} path the path that we are posting to
   * @param {*} data a json object in text format
   * @returns an observable for the http response.
   *
   * @memberOf DataService
   */

  private _post(path: string, body: string) {
    const headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(path, body, {'headers': headers} )
    .catch((error: Response) => {
      return Observable.throw(error || 'Server error');
    });
  }

  /**
   * Update a record in the dabase
   *
   * @private
   * @param {string} path The path to use.
   * @param {*} body the object to be updated
   * @returns an Observable to the response.
   *
   * @memberOf DataService
   */
  private _put(path: string, body: any) {
    const headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put(path, body, {'headers': headers} )
    .catch((error: Response) => {
      return Observable.throw(error || 'Server error');
    });
  }


  /**
   * @description
   * GET all organization records.
   *
   * Returns an Observable Array of `Organization`(interface).
   *
   * @returns an Observable Array of `Organization`(interface).
   */
  getOrganizations(): Observable<Organization[]> {
    if (environment.demo) {
      return Observable.of(testData.orgList);
    }
    return this._get(this._paths.root + this._paths.organizations);
  }

  /**
   * @param options Accepts minimum 1 key+value pair from the Organization interface.
   *
   * @description
   * GET only 1 Organization record data with parameterized query.
   * `options` is an Object argument which should have at least 1 property + value.
   *
   * @returns an Observable of `Organization`(interface).
   */
  getOrganization(options: Object): Observable<Organization> {
    if (options === undefined || typeof options === 'object' || Object.keys(options).length <= 0) {
      return;
    }

    return this._get(this._paths.root + this._paths.organizations, options);
  }

  /**
   * get a single organization by ID
   *
   * @param {number} organizationId the organization ID
   * @returns an observable
   *
   * @memberOf DataService
   */
  getOrganizationById(organizationId: number) {
    if (environment.demo) {
      return Observable.of(testData.orgList.filter((v, k) => v.organizationId === organizationId)[0]);
    }

    return this._get(this._paths.root + this._paths.organisationsbyId + organizationId);
  }

  /**
   * create a new organization
   *
   * @param {string} data the organization data as json
   * @returns an observable.
   *
   * @memberOf DataService
   */
  postOrganization(data: string) {
    return this._post(this._paths.root + this._paths.organizations, data);
  }




  /**
   * GET all Projects records.
   *
   * Returns an Observable Array of `Project`(interface).
   *
   * @returns an Observable Array of `Project`(interface).
   */
  getProjects(): Observable<Project[]> {
    if (environment.demo) {
      return Observable.of(testData.projectList);
    }
    return this._get(this._paths.root + this._paths.projects);
  }

  /**
   * Check if a project is closed, according to the business definition of closed projects.
   *
   * @param {Project} project the project to check.
   * @returns {Boolean} true if the project is closed.
   *
   * @memberOf DataService
   */
  isClosedProject(project: Project): Boolean {
    return project.toDate <= new Date() || project.amountToBeRaised <= project.raisedFunding;
  }
  /**
   * Get a list of closed projects.
   * Note that we get all the projects and filter them in the client.
   * This is awkward, but we had to do it because backend did accept to do it there.
   *
   * @returns {Observable<Project[]>}
   *
   * @memberOf DataService
   */
  getClosedProjects(): Observable<Project[]> {
    if (environment.demo) {
      return Observable.of(testData.projectList.filter((v, k) => this.isClosedProject(v)));
    }
    return this.getProjects().map(
      res =>  res.filter((v, k) => this.isClosedProject(v))
    );
  }

  /**
   * Get a list of closed projects.
   * Note that we get all the projects and filter them in the client.
   * This is awkward, but we had to do it because backend did accept to do it there.
   *
   * @returns {Observable<Project[]>}
   *
   * @memberOf DataService
   */
  getOpenProjects(): Observable<Project[]> {
    if (environment.demo) {
      return Observable.of(testData.projectList.filter((v, k) => !this.isClosedProject(v)));
    }
    return this.getProjects().map(
      res => {
        return res.filter((v, k) => !this.isClosedProject(v));
      }
    );
  }

  /**
   * @argument options Accepts minimum 1 key+value pair from the Project interface.
   *
   * @description
   * GET only 1 Project record data with parameterized query.
   * `options` is an Object argument which should have at least 1 property + value.
   *
   * Returns an Observable of `Project`(interface).
   *
   * @returns an Observable of `Project`(interface).
   */
  getProject(options: Object): Observable<Project> {
    if (options === undefined || typeof options === 'object' || Object.keys(options).length <= 0) {
      return;
    }

    return this._get(this._paths.root + this._paths.projects, options);
  }

  /**
   * get a specific project by its ID
   *
   * @param {number} id the ID of the project, this is different from the project number.
   * @returns
   *
   * @memberOf DataService
   */
  getProjectById(id: number) {
    if (environment.demo) {
      return Observable.of(testData.projectList.filter((v, k) => v.id === id )[0]);
    }
    return this._get(this._paths.root + this._paths.projectById + id);
  }

  /**
   * Get a project by the project number
   *
   * @param {string} projectId the project number
   * @returns
   *
   * @memberOf DataService
   */
  getProjectByProjectId(projectId: string) {
    return this._get(this._paths.root + this._paths.projectByProjectId + projectId);
  }

  /**
   * Post a project to the backend
   *
   * @param {*} data
   * @returns
   *
   * @memberOf DataService
   */
  postProject(data: any) {
    return this._post(this._paths.root + this._paths.saveproject, data);
  }

  /**
   * update a project in the database
   *
   * @param {number} id The ID of the  project
   * @param {*} data JSON object with the project data
   * @returns an objervable
   *
   * @memberOf DataService
   */
  putProject(id: number, data: any) {
    return this._put(this._paths.root + this._paths.saveproject + id, data);
  }





  /**
   * @description
   * GET all activity records.
   *
   * Returns an Observable Array of `Activity`(interface).
   *
   * @returns an Observable Array of `Activity`(interface).
   */
  getActivities(): Observable<Activity[]> {
    if (environment.demo) {
      return Observable.of(testData.activitiesList);
    }
    return this._get(this._paths.root + this._paths.activities);
  }

  getActivityById(activityId: number): Observable<Activity> {
    if (environment.demo) {
      return Observable.of(testData.activitiesList.filter((v, k) => v.eventId === activityId)[0] );
    }
    return this._get(this._paths.root + this._paths.activities + activityId);
  }

  postActivity(body: string) {
    return this._post(this._paths.root + this._paths.activities, body);
  }

  getActivitiesOfProjectId(projectId: number): Observable<Activity[]> {
    if (environment.demo) {
      return Observable.of(testData.activitiesList.filter((v, k) => v.projectId === projectId));
    }
    return this.getActivities().map(
      response => response.filter((v, k) => v.projectId === projectId )
    );
  }

  /**
   * @param http An instance of HttpClient to enable functions in this service to use HTTP requests like GET, POST, PUT etc.
   */
  constructor(private http: HttpClient) {

  }

  /* ////////////////////////////////////////////////////////////////////////
  *  /////////////////////////                      /////////////////////////
  *  ///////////////////////// TESTING PURPOSE ONLY /////////////////////////
  *  /////////////////////////                      /////////////////////////
  *  ////////////////////////////////////////////////////////////////////////
  */
}

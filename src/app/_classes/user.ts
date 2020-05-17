import { propertyMap } from 'model-mapper';

export class UserRight {

  @propertyMap()
  public name: string;

}

export class User {

  @propertyMap()
  public id: string;

  @propertyMap()
  public username: string;

  @propertyMap()
  public firstname: string;

  @propertyMap()
  public lastname: string;

  @propertyMap({ type: [UserRight] })
  public rights: UserRight[];

  public get fullname() {
    return `${this.firstname} ${this.lastname}`;
  }

}

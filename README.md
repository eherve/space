# Space Game

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.0.3.

## Information

* Change app name in environment files, this name is used in localeStorage key.
* To add custom svg icon, add icon files in src/assets/icons and add svg icon in matIconRegistry in custon-icon.service.ts.
* Mock: mock-backend.interceptor.ts mock the backend for front only development. Remove interceptor from app.module.ts when backend ready.

## Generate i18n file

```ng xi18n --output-path src/locale```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `ng serve --configuration=fr` for fr dev server.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Run `ng build --configuration=fr` to build fr version of the project. Use `ng build --configuration=fr-production` for fr production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# ReactiveFormExercise

## Description

This project is an attributes management application. Attributes are grouped by categories. There is one tab per category.

### Features

In this application, you can :
- create, modify and delete an attribute
- switch between categories using the tabs

You will have to respect the following rules:
- attributes can't have a duplicate name.
- attribute is valid depending on the following conditions :
  - When selecting format 'NONE' :
    - You won't be able to add an empty value.
  - When selecting format 'NUMBER' :
    - Range min/max has to be valid (min cant be gt max, max can be lt min) and these can be either float or integer values. Both are required.
    - Precision is the step factor between the defined ranges; its value has to allow the user to go through min to max and not exceed it. Required.
    - Accuracy acts the same than Precision.

If one of the values you enter don't comply with these rules, the save button will be disabled, and you shall see an error message.

Also, selecting 'OBJECT' as a data-type value will disable the default value and format fields.

Click on 'Save' and 'Cancel' buttons doesn't do anything (they're fake buttons).

--

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

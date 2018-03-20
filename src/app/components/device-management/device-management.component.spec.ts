import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';

import { CustomMaterialModule } from '../../material.module';
import { DeviceManagementComponent } from './device-management.component';
import { Attribute } from '../../models/attribute.model';
import { CATEGORIES } from '../../constants/categories.constant';

describe('DeviceManagementComponent', () => {
  let component: DeviceManagementComponent;
  let fixture: ComponentFixture<DeviceManagementComponent>;
  const enumerationValueLabel = 'Test enumeration value';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [
        ReactiveFormsModule,
        CustomMaterialModule
      ],
      declarations: [ DeviceManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be properly initialized', () => {
    expect(component.form).toBeDefined();

    const expectedForm = component.initializeForm();

    expect(expectedForm.controls.length).toEqual(component.form.controls.length);
    expect(Object.keys(expectedForm.controls)).toEqual(Object.keys(component.form.controls));
    expect(((expectedForm.controls['attributes'] as FormArray).controls as FormGroup[]).length)
      .toEqual(component.attributes.controls.length);
    expect(Object.keys(((expectedForm.controls['attributes'] as FormArray).controls as FormGroup[])))
      .toEqual(Object.keys(component.attributes.controls));
  });

  it('should have proper behaviors for each attribute form', () => {
    (component.attributes.controls as FormGroup[]).forEach(attribute => {
        expect(component.fieldChangesSubscriptions[attribute.get('id').value]).toBeDefined();
        expect(component.rangeChangesSubscriptions[attribute.get('id').value]).toBeDefined();
    });
  });

  it('should contain an attributes control in its form', () => {
    expect(component.form.controls).toBeDefined();
    expect(Object.keys(component.form.controls).length).toEqual(1);
    expect(component.form.controls['attributes']).toBeDefined();
  });

  it('should contain 3 mock attributes', () => {
    expect(Object.keys(component.attributes.controls).length).toEqual(3);
  });

  it('should be able to add an attribute', () => {
    const attributesNumber = Object.keys(component.attributes.controls).length;

    component.addAttribute(CATEGORIES[3]);

    const attributesNumberAfterAdding = Object.keys(component.attributes.controls).length;

    expect(attributesNumber + 1).toEqual(attributesNumberAfterAdding);
  });

  it('should be able to remove an attribute', () => {
    const attributesNumber = Object.keys(component.attributes.controls).length;

    component.removeAttribute(component.attributes.controls[component.attributes.controls.length - 1] as FormGroup);

    const attributesNumberAfterAdding = Object.keys(component.attributes.controls).length;

    expect(attributesNumber - 1).toEqual(attributesNumberAfterAdding);
  });

  it('should be able to add an enumeration value for an attribute', () => {
    const attribute = component.attributes.controls[0] as FormGroup;
    const attributeEnumerationsNumber = attribute.get('enumerationValues').value.length;

    attribute.get('enumerationValue').setValue(enumerationValueLabel);

    component.addEnumerationValue(attribute);

    const attributeEnumerationsNumberAfterAdding = attribute.get('enumerationValues').value.length;

    expect(attributeEnumerationsNumber + 1).toEqual(attributeEnumerationsNumberAfterAdding);
  });

  it('should be able to remove an enumeration value for an attribute', () => {
    const attribute = component.attributes.controls[0] as FormGroup;
    const attributeEnumerationsNumber = attribute.get('enumerationValues').value.length;
    const enumerationValueIndex = attribute.get('enumerationValues').value.indexOf(enumerationValueLabel);

    component.removeEnumerationValue(attribute, enumerationValueIndex);

    const attributeEnumerationsNumberAfterAdding = attribute.get('enumerationValues').value.length;

    expect(attributeEnumerationsNumber - 1).toEqual(attributeEnumerationsNumberAfterAdding);
  });

  it('should be able to wrap an attribute', () => {
    const attribute = component.attributes.controls[0] as FormGroup;

    component.wrapAttribute(attribute);

    expect(component.isAttributeWrapped(attribute)).toBeTruthy();
  });

  it('should be able to unwrap an attribute', () => {
    const attribute = component.attributes.controls[0] as FormGroup;

    component.unwrapAttribute(attribute);

    expect(component.isAttributeWrapped(attribute)).toBeFalsy();
  });

  it('should be able to identify the last attribute of a category', () => {
    const category = CATEGORIES[0];
    const attribute = component.addAttribute(category);
    const otherCategoryAttribute = component.getCategoryAttributes(CATEGORIES[1])[0];

    expect(component.isLastCategoryAttribute(category, attribute)).toBeTruthy();
    expect(component.isLastCategoryAttribute(category, otherCategoryAttribute)).toBeFalsy();

    component.removeAttribute(attribute);
  });

  it('should detect errors on duplicated names', () => {
    const attributeName = component.getCategoryAttributes(CATEGORIES[0])[0].get('name');
    const attributeNameValue = attributeName.value;
    const otherAttributeName = component.getCategoryAttributes(CATEGORIES[1])[0].get('name');
    const otherAttributeNameValue = otherAttributeName.value;

    otherAttributeName.setValue(attributeNameValue);

    expect(attributeName.errors['duplicatedName']).toBeDefined();
    expect(otherAttributeName.errors['duplicatedName']).toBeDefined();

    otherAttributeName.setValue(otherAttributeNameValue);
  });

  it('should detect errors for integer fields', () => {
    const attribute = component.attributes.controls[0];
    const rangeMin = attribute.get('rangeMin');

    // Display range
    attribute.get('format').setValue('NUMBER');

    rangeMin.setValue('a string');

    expect(rangeMin.errors['mustBeAnIntegerOrAFloat']).toBeDefined();

    rangeMin.setValue('0.75');

    expect(rangeMin.errors).toBeNull();

    rangeMin.setValue('2');

    expect(rangeMin.errors).toBeNull();

    // Hide range back
    attribute.get('format').setValue('NUMBER');
  });

  it('should detect errors regarding range min and max', () => {
    const attribute = component.attributes.controls[0];
    const rangeMin = attribute.get('rangeMin');
    const rangeMax = attribute.get('rangeMax');

    // Display range fields
    attribute.get('format').setValue('NUMBER');

    rangeMin.setValue('1');
    rangeMax.setValue('1');

    expect(rangeMin.errors['rangeMinMustBeLtThanRangeMax']).toBeDefined();
    expect(rangeMax.errors['rangeMaxMustBeGtThanRangeMin']).toBeDefined();

    rangeMax.setValue('2');

    expect(rangeMin.errors).toBeNull();
    expect(rangeMax.errors).toBeNull();

    // Hide range back
    attribute.get('format').setValue('NUMBER');
  });

  it('should detect errors for step factors', () => {
    const attribute = component.attributes.controls[0];
    const rangeMin = attribute.get('rangeMin');
    const rangeMax = attribute.get('rangeMax');
    const precision = attribute.get('rangePrecision');
    const accruacy = attribute.get('rangeAccuracy');

    // Display range fields
    attribute.get('format').setValue('NUMBER');

    // Setting valid values for range min and max
    rangeMin.setValue('1');
    rangeMax.setValue('2');

    precision.setValue('0.33');
    accruacy.setValue('10');

    expect(precision.errors['mustRespectStepFactorRules']).toBeDefined();
    expect(accruacy.errors['mustRespectStepFactorRules']).toBeDefined();

    precision.setValue('0.25');
    accruacy.setValue('0.125');

    expect(rangeMin.errors).toBeNull();
    expect(rangeMax.errors).toBeNull();

    // Hide range back
    attribute.get('format').setValue('NUMBER');
  });
});

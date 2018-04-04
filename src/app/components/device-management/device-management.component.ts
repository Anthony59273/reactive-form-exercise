import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Category } from '../../models/category.model';
import { Attribute } from '../../models/attribute.model';
import { AttributeEnumerationValue } from '../../models/attribute-enumeration-value.model';
import * as attributeValidators from '../validators/attribute.validators';
import { categoriesMock } from '../../mocks/categories.mock';
import { CATEGORIES } from '../../constants/categories.constant';
import { ATTRIBUTE_DATA_TYPE_VALUES } from '../../constants/attribute-data-type-values.constant';
import { ATTRIBUTE_FORMAT_VALUES } from '../../constants/attribute-format-values.constant';
import { ERROR_MESSAGES } from '../../constants/attribute-input-errors.constant';

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.scss']
})
export class DeviceManagementComponent implements OnInit, OnDestroy {

  form: FormGroup;
  areAttributesWrapped: boolean[] = [];
  fieldChangesSubscriptions: Subscription[][] = [];
  rangeChangesSubscriptions: Subscription[][] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.initializeForm();

    (this.attributes.controls as FormGroup[]).forEach(attribute => this.addAttributeFormBehaviors(attribute));
  }

  initializeForm(): FormGroup {
    const attributes = this.initializeAttributes();

    return this.fb.group({
      attributes
    }, {
      validator: attributeValidators.attributesValidator
    });
  }

  addAttribute(category: Category): FormGroup {
    const attribute = new Attribute({ category });
    const attributeForm = this.createAttributeForm(attribute);

    this.attributes.push(attributeForm);

    return attributeForm;
  }

  removeAttribute(attribute: FormGroup): void {
    const attributeIndex = this.getAttributeIndex(attribute);

    this.endAttributeSubscriptions(attribute);

    this.attributes.removeAt(attributeIndex);
  }

  areEnumerationsDisplayed(attribute: FormGroup): boolean {
    return attribute.get('format').enabled && attribute.get('format').value === 'NONE';
  }

  addEnumerationValue(attribute: FormGroup): void {
    const enumerationValueLabel = attribute.get('enumerationValue').value;

    attribute.get('enumerationValues').value.push(new AttributeEnumerationValue(enumerationValueLabel));
    attribute.get('enumerationValue').reset('');
  }

  removeEnumerationValue(attribute: FormGroup, enumerationValueIndex: number): void {
    attribute.get('enumerationValues').value.splice(enumerationValueIndex, 1);
  }

  isRangeDisplayed(attribute: FormGroup): boolean {
    return attribute.get('format').enabled && attribute.get('format').value === 'NUMBER';
  }

  wrapAttribute(attribute: FormGroup): void {
    this.areAttributesWrapped[attribute.get('id').value] = true;
  }

  unwrapAttribute(attribute: FormGroup): void {
    this.areAttributesWrapped[attribute.get('id').value] = false;
  }

  isAttributeWrapped(attribute: FormGroup): boolean {
    return !!this.areAttributesWrapped[attribute.get('id').value];
  }

  isLastCategoryAttribute(category: Category, attribute: FormGroup): boolean {
    const categoryAttributes = this.getCategoryAttributes(category);

    return categoryAttributes.indexOf(attribute) === (categoryAttributes.length - 1);
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  getAttributeIndex(attribute: FormGroup): number {
    return this.attributes.controls.indexOf(attribute);
  }

  getCategoryAttributes(category: Category): FormGroup[] {
    return (this.attributes.controls as FormGroup[]).filter(attribute => {
      return attribute.get('category').value === category.label;
    });
  }

  getAttributeInputErrorMessage(control: FormControl): string {
    const errorNames = control.errors ? Object.keys(control.errors) : [];

    if (errorNames.length) {
      return ERROR_MESSAGES[errorNames[0]];
    }

    return '';
  }

  ngOnDestroy() {
    (this.attributes.controls as FormGroup[]).forEach(attribute => this.endAttributeSubscriptions(attribute));
  }

  private initializeAttributes(): FormArray {
    const attributes = categoriesMock.map(attribute => this.createAttributeForm(attribute));

    return this.fb.array(attributes);
  }

  private createAttributeForm(attribute: Attribute): FormGroup {
    const enumerationValues = attribute.enumerationValues ? attribute.enumerationValues : [];
    const attributeForm = this.fb.group({
      id: attribute.id,
      category: attribute.category.label,
      name: [attribute.name, attributeValidators.nameValidators],
      description: attribute.description,
      deviceResourceType: [{ value: attribute.deviceResourceType, disabled: true }],
      defaultValue: attribute.defaultValue,
      dataType: attribute.dataType,
      format: attribute.format,
      enumerationValue: '',
      enumerationValues: [enumerationValues],
      rangeMin: [attribute.range.min, attributeValidators.rangeMinValidators],
      rangeMax: [attribute.range.max, attributeValidators.rangeMaxValidators],
      rangeUOM: attribute.range.unitOfMeasurement,
      rangePrecision: [attribute.range.precision, attributeValidators.rangePrecisionValidators],
      rangeAccuracy: [attribute.range.accuracy, attributeValidators.rangeAccuracyValidators]
    }, {
      validator: attributeValidators.attributeValidator
    });

    this.addAttributeFormBehaviors(attributeForm);

    if (!this.isRangeDisplayed(attributeForm)) {
      this.disableRangeFieldsWithValidators(attributeForm);
    }

    return attributeForm;
  }

  private enableDataTypeRelatedFields(attribute: FormGroup): void {
    attribute.get('format').enable();
    attribute.get('defaultValue').enable();
  }

  private disableDataTypeRelatedFields(attribute: FormGroup): void {
    attribute.get('format').disable();
    attribute.get('defaultValue').disable();
  }

  private resetEnumerationValues(attribute: FormGroup): void {
    const { enumerationValues } = new Attribute();
    const defaultEnumerationValues = enumerationValues;

    attribute.get('enumerationValue').reset(this.areEnumerationsDisplayed(attribute) ? '' : null);
    attribute.get('enumerationValues').reset(this.areEnumerationsDisplayed(attribute) ? [] : defaultEnumerationValues);
  }

  private enableRangeFieldsWithValidators(attribute: FormGroup): void {
    attribute.get('rangeMin').enable();
    attribute.get('rangeMax').enable();
    attribute.get('rangePrecision').enable();
    attribute.get('rangeAccuracy').enable();
  }

  private disableRangeFieldsWithValidators(attribute: FormGroup): void {
    attribute.get('rangeMin').disable();
    attribute.get('rangeMax').disable();
    attribute.get('rangePrecision').disable();
    attribute.get('rangeAccuracy').disable();
  }

  private resetRangeFieldsValue(attribute: FormGroup): void {
    const { range } = new Attribute();
    const defaultRange = range;

    attribute.get('rangeMin').reset(defaultRange.min);
    attribute.get('rangeMax').reset(defaultRange.max);
    attribute.get('rangeUOM').reset(defaultRange.unitOfMeasurement);
    attribute.get('rangePrecision').reset(defaultRange.precision);
    attribute.get('rangeAccuracy').reset(defaultRange.accuracy);
  }

  private updateRangeMinValueAndValidity(attribute: FormGroup): void {
    attribute.get('rangeMin').updateValueAndValidity({ emitEvent: false });
  }

  private updateRangeMaxValueAndValidity(attribute: FormGroup): void {
    attribute.get('rangeMax').updateValueAndValidity({ emitEvent: false });
  }

  private updateRangeMinMaxValueAndValidity(attribute: FormGroup): void {
    this.updateRangeMinValueAndValidity(attribute);
    this.updateRangeMaxValueAndValidity(attribute);
  }

  private addDataTypeChangesSubscription(attribute: FormGroup): void {
    const dataTypeChangesSubscription = attribute.get('dataType').valueChanges.subscribe(dataTypeValue => {
      if (dataTypeValue === 'OBJECT') {
        this.disableDataTypeRelatedFields(attribute);
      } else {
        this.enableDataTypeRelatedFields(attribute);
      }
    });

    this.addFieldChangesSubscription(attribute, dataTypeChangesSubscription);
  }

  private addFormatChangesSubscription(attribute: FormGroup): void {
    const formatChangesSubscription = attribute.get('format').valueChanges.subscribe(formatValue => {
      this.resetEnumerationValues(attribute);

      if (this.isRangeDisplayed(attribute)) {
        this.enableRangeFieldsWithValidators(attribute);
      } else {
        this.resetRangeFieldsValue(attribute);
        this.disableRangeFieldsWithValidators(attribute);
      }
    });

    this.addFieldChangesSubscription(attribute, formatChangesSubscription);
  }

  private addAttributeFieldChangesSubscriptions(attribute: FormGroup): void {
    this.addDataTypeChangesSubscription(attribute);
    this.addFormatChangesSubscription(attribute);
  }

  private addRangeMinChangesSubscription(attribute: FormGroup): void {
    const rangeMinChangesSubscription = attribute.get('rangeMin').valueChanges.subscribe(rangeMin => {
      this.updateRangeMaxValueAndValidity(attribute);
    });

    this.addRangeChangesSubscription(attribute, rangeMinChangesSubscription);
  }

  private addRangeMaxChangesSubscription(attribute: FormGroup): void {
    const rangeMaxChangesSubscription = attribute.get('rangeMax').valueChanges.subscribe(rangeMax => {
      this.updateRangeMinValueAndValidity(attribute);
    });

    this.addRangeChangesSubscription(attribute, rangeMaxChangesSubscription);
  }

  private addRangePrecisionChangesSubscription(attribute: FormGroup): void {
    const rangePrecisionChangesSubscription = attribute.get('rangePrecision').valueChanges.subscribe(rangePrecision => {
      this.updateRangeMinMaxValueAndValidity(attribute);
    });

    this.addRangeChangesSubscription(attribute, rangePrecisionChangesSubscription);
  }

  private addRangeAccuracyChangesSubscription(attribute: FormGroup): void {
    const rangeAccuracyChangesSubscription = attribute.get('rangeAccuracy').valueChanges.subscribe(rangeAccuracy => {
      this.updateRangeMinMaxValueAndValidity(attribute);
    });

    this.addRangeChangesSubscription(attribute, rangeAccuracyChangesSubscription);
  }

  private addAttributeRangeChangesSubscriptions(attribute: FormGroup): void {
    this.addRangeMinChangesSubscription(attribute);
    this.addRangeMaxChangesSubscription(attribute);
    this.addRangePrecisionChangesSubscription(attribute);
    this.addRangeAccuracyChangesSubscription(attribute);
  }

  private addAttributeFormBehaviors(attribute: FormGroup): void {
    this.addAttributeFieldChangesSubscriptions(attribute);
    this.addAttributeRangeChangesSubscriptions(attribute);
  }

  private addFieldChangesSubscription(attribute: FormGroup, fieldChangesSubscription: Subscription): void {
    if (!this.fieldChangesSubscriptions[attribute.get('id').value]) {
      this.fieldChangesSubscriptions[attribute.get('id').value] = [];
    }

    this.fieldChangesSubscriptions[attribute.get('id').value].push(fieldChangesSubscription);
  }

  private addRangeChangesSubscription(attribute: FormGroup, rangeChangesSubscription: Subscription): void {
    if (!this.rangeChangesSubscriptions[attribute.get('id').value]) {
      this.rangeChangesSubscriptions[attribute.get('id').value] = [];
    }

    this.rangeChangesSubscriptions[attribute.get('id').value].push(rangeChangesSubscription);
  }

  private endAttributeFieldChangesSubscriptions(attribute: FormGroup): void {
    this.fieldChangesSubscriptions[attribute.get('id').value].forEach(fieldChangesSubscription => fieldChangesSubscription.unsubscribe());
  }

  private endAttributeRangeChangesSubscriptions(attribute: FormGroup): void {
    this.rangeChangesSubscriptions[attribute.get('id').value].forEach(rangeChangesSubscription => rangeChangesSubscription.unsubscribe());
  }

  private endAttributeSubscriptions(attribute: FormGroup): void {
    this.endAttributeFieldChangesSubscriptions(attribute);
    this.endAttributeRangeChangesSubscriptions(attribute);
  }

  get categories() {
    return CATEGORIES;
  }

  get attributeDataTypes() {
    return ATTRIBUTE_DATA_TYPE_VALUES;
  }

  get attributeFormats() {
    return ATTRIBUTE_FORMAT_VALUES;
  }

}

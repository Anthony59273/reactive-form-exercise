import { FormGroup, FormArray, FormControl, AbstractControl, ValidationErrors, Validators, ValidatorFn } from '@angular/forms';

const getDuplicatedNames = (attributes: FormGroup[], nameControls: FormControl[]): FormControl[] => {
  return attributes.reduce((duplicates, attribute) => {
    attributes.forEach(otherAttribute => {
      const haveSameName = attribute.get('name').value === otherAttribute.get('name').value;
      const haveDifferentId = attribute.get('id').value !== otherAttribute.get('id').value;

      if (haveSameName && haveDifferentId) {
        duplicates.push(attribute.get('name'));
      }
    });

    return duplicates;
  }, []);
};

const removeAllDuplicatedNameErrors = (nameControls: FormControl[]): void => {
  nameControls.forEach(nameControl => {
    const errors = nameControl.errors ? nameControl.errors : {};

    if (errors.duplicatedName) {
      delete errors.duplicatedName;
    }

    if (Object.keys(errors).length) {
      nameControl.setErrors(errors);
    } else {
      nameControl.setErrors(null);
    }
  });
};

const setDuplicatedNameError = (duplicatedNameControls: FormControl[]): void => {
  if (duplicatedNameControls.length > 1) {
    duplicatedNameControls.forEach(duplicatedNameControl => {
      duplicatedNameControl.markAsTouched();
      duplicatedNameControl.setErrors({ 'duplicatedName': true });
    });
  }
};

const duplicatedName = (control: AbstractControl): ValidationErrors => {
  const attributesForm: FormArray = control.get('attributes') as FormArray;
  const attributes: FormGroup[] = attributesForm.controls as FormGroup[];
  const nameControls: FormControl[] = attributes.map(attribute => attribute.get('name') as FormControl);
  const duplicatedNameControls = getDuplicatedNames(attributes, nameControls);

  removeAllDuplicatedNameErrors(nameControls);
  setDuplicatedNameError(duplicatedNameControls);

  return null;
};

const integerOrFloatValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors => {
    const value = Number(control.value);

    if (Number.isNaN(value)) {
      return {
        'mustBeAnIntegerOrAFloat': {}
      };
    }

    return null;
  };
};

const stepFactorValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors => {
    if (control.value && control.parent.get('rangeMin').value && control.parent.get('rangeMax').value) {
      const value = Number(control.value);
      const rangeMin = Number(control.parent.get('rangeMin').value);
      const rangeMax = Number(control.parent.get('rangeMax').value);

      if (!Number.isNaN(rangeMin) && !Number.isNaN(rangeMax)) {
        const rangeBetween = rangeMax - rangeMin;

        if (rangeBetween % value !== 0) {
          control.markAsTouched();

          return {
            'mustRespectStepFactorRules': {}
          };
        }
      }
    }

    return null;
  };
};

const rangeMinMaxValidator = (control: AbstractControl): ValidationErrors => {
  const rangeMin = control.get('rangeMin');
  const rangeMinValue = rangeMin.value ? Number(rangeMin.value) : NaN;
  const rangeMax = control.get('rangeMax');
  const rangeMaxValue = rangeMax.value ? Number(rangeMax.value) : NaN;

  if (!Number.isNaN(rangeMinValue) && !Number.isNaN(rangeMaxValue) && rangeMinValue >= rangeMaxValue) {
    rangeMin.markAsTouched();
    rangeMax.markAsTouched();
    rangeMin.setErrors({ 'rangeMinMustBeLtThanRangeMax': true });
    rangeMax.setErrors({ 'rangeMaxMustBeGtThanRangeMin': true });
  }

  return null;
};

export const attributesValidator = duplicatedName;
export const attributeValidator = rangeMinMaxValidator;
export const nameValidators = Validators.required;
export const rangeMinValidators = [Validators.required, integerOrFloatValidator()];
export const rangeMaxValidators = [Validators.required, integerOrFloatValidator()];
export const rangePrecisionValidators = [Validators.required, integerOrFloatValidator(), stepFactorValidator()];
export const rangeAccuracyValidators = [Validators.required, integerOrFloatValidator(), stepFactorValidator()];

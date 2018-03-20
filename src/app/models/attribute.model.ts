import { Category } from './category.model';
import { AttributeEnumerationValue } from './attribute-enumeration-value.model';
import { AttributeRange } from './attribute-range.model';
import { ATTRIBUTE_DATA_TYPE_VALUES } from '../constants/attribute-data-type-values.constant';
import { ATTRIBUTE_FORMAT_VALUES } from '../constants/attribute-format-values.constant';

export class Attribute {

  id: String;
  category: Category;
  name: String = '';
  description: String = '';
  deviceResourceType: String = 'Default Value';
  defaultValue: String = '';
  dataType: String = ATTRIBUTE_DATA_TYPE_VALUES.filter(attributeDataType => attributeDataType.isDefault)[0].label;
  format: String = ATTRIBUTE_FORMAT_VALUES.filter(attributeFormat => attributeFormat.isDefault)[0].label;
  enumerationValues: AttributeEnumerationValue[] = null;
  range: AttributeRange = new AttributeRange();

  constructor(params?: { category: Category, name?: String, description?: String }) {
    this.id = this.generateId();

    if (params) {
      this.category = params.category;

      if (params.name) {
        this.name = params.name;
      }

      if (params.description) {
        this.description = params.description;
      }
    }
  }

  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  equals(otherAttribute) {
    return this.id === otherAttribute.id;
  }

}

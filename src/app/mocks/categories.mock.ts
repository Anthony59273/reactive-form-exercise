import { Attribute } from '../models/attribute.model';
import { AttributeEnumerationValue } from '../models/attribute-enumeration-value.model';

import { CATEGORIES } from '../constants/categories.constant';

const attributeWithEnumerations = new Attribute({
  category: CATEGORIES[0],
  name: 'name',
  description: 'Name for the device as provided by the user'
});

attributeWithEnumerations.enumerationValues = [
  new AttributeEnumerationValue('first value'),
  new AttributeEnumerationValue('second value')
];

const sensorAttribute = new Attribute({
  category: CATEGORIES[1],
  name: 'description',
  description: 'Description of the sensor'
});

sensorAttribute.dataType = 'OBJECT';

export const categoriesMock: Attribute[] = [
  attributeWithEnumerations,
  new Attribute({
    category: CATEGORIES[0],
    name: 'location',
    description: 'Location provided by the user'
  }),
  sensorAttribute
];

export class Category {

  label: String;
  description: String;

  constructor(label: String, description: String) {
    this.label = label;
    this.description = description;
  }

  equals(otherCategory) {
    return this.label === otherCategory.label;
  }

}

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  

 export  interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    email?: boolean;
    password?: boolean;
  }
  

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  // required?: boolean;   // you can keep or move into validations.required
  defaultValue?: any;
  options?: string[];   // For select, radio, checkbox
  validations?: ValidationRules;  // New validations object
  // For derived fields
  isDerived?: boolean;
  derivedFrom?: string[];
  formula?: string;
}

export interface FormSchema {
  id: string;
  name: string;
  createdAt: string;
  fields: Field[];
}

import type {FormSchema} from './types'
const STORAGE_KEY = 'dynamic_forms_v1';

export function loadForms(): FormSchema[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteFormFromStorage(formId: string) {
  const forms = loadForms();
  const updatedForms = forms.filter(f => f.id !== formId);
  localStorage.setItem('forms', JSON.stringify(updatedForms));
}


export function saveForm(schema: FormSchema) {
  const forms = loadForms();
  forms.push(schema);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import { type Field, type FormSchema } from './types';
import { loadForms, saveForm,deleteFormFromStorage } from './localStorage';

interface FormBuilderState {
  currentFields: Field[];
  savedForms: FormSchema[];
}

const initialState: FormBuilderState = {
  currentFields: [],
  savedForms: loadForms(),
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    addField: (state, action: PayloadAction<Omit<Field, 'id'>>) => {
      state.currentFields.push({ ...action.payload, id: nanoid() });
    },
    removeField: (state, action: PayloadAction<string>) => {
      state.currentFields = state.currentFields.filter(f => f.id !== action.payload);
    },
    updateField: (state, action: PayloadAction<{ id: string; changes: Partial<Field> }>) => {
      const index = state.currentFields.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.currentFields[index] = {
          ...state.currentFields[index],
          ...action.payload.changes,
        };
      }
    },
    reorderFields: (state, action: PayloadAction<Field[]>) => {
      state.currentFields = action.payload;
    },
    saveCurrentForm: (state, action: PayloadAction<string>) => {
      const schema: FormSchema = {
        id: nanoid(),
        name: action.payload,
        createdAt: new Date().toISOString(),
        fields: state.currentFields,
      };
      state.savedForms.push(schema);
      saveForm(schema);
      // optionally clear currentFields here
      state.currentFields = [];
    },
    clearFields: (state) => {
      state.currentFields = [];
    },
    deleteForm: (state, action: PayloadAction<string>) => {
      // Remove from Redux state
      state.savedForms = state.savedForms.filter(form => form.id !== action.payload);
      // Remove from localStorage
      // Assuming saveForm saves a single form, you need a separate delete function.
      deleteFormFromStorage(action.payload);
    },
    
  }
});

export const { addField, removeField, updateField, reorderFields, saveCurrentForm, clearFields,deleteForm } = formBuilderSlice.actions;
export default formBuilderSlice.reducer;

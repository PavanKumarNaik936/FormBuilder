# React + Redux Form Builder

A dynamic form builder application built with React, TypeScript, Material-UI (MUI), Redux Toolkit, and localStorage. Users can create customizable forms with validations, preview forms as end users, and manage saved forms — all without a backend.

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
- [Project Structure & Routes](#project-structure--routes)  
- [Usage](#usage)  
- [Future Improvements](#future-improvements)  
- [License](#license)  

---

## Project Overview

This project enables users to build forms dynamically by adding various types of fields with custom validation rules and derived fields based on formulas. Users can preview their forms to simulate end-user interaction and view/manage all saved forms stored in localStorage.

---

## Features

### Dynamic Form Creation
- Add, configure, reorder, and delete form fields of types:  
  Text, Number, Textarea, Select, Radio, Checkbox, Date

### Field Configuration
- Set label, required flag, default value  
- Validation rules: required, min/max length, email format, custom password rules

### Derived Fields
- Compute field values based on other fields using user-defined formulas  
- Example: Calculate age from date of birth

### Form Preview
- Render the form as end users will see it  
- Real-time validation and error messages  
- Auto-updating derived fields

### Form Management
- Save forms with a custom name  
- Persist all form schemas in localStorage  
- View a list of saved forms with creation date  
- Open any saved form in preview mode

---

## Tech Stack

- React (with TypeScript)  
- Redux Toolkit (for state management)  
- Material-UI (MUI) for UI components  
- React Router DOM for routing  
- Framer Motion for animations  
- Sonner for toast notifications  
- localStorage for persistent form data (no backend)

---

## Getting Started

### Prerequisites

- Node.js (v16+)  
- npm or yarn  

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/react-redux-form-builder.git
    cd react-redux-form-builder
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3. Start the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

4. Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the app running.

---

## Project Structure & Routes

| Route      | Description                         |
|------------|-----------------------------------|
| `/create`  | Build and configure dynamic forms |
| `/preview` | Preview the created form with validation |
| `/myforms` | List all saved forms and access previews |

---

## Usage

### Create Form (`/create`)

- Add various field types.  
- Configure labels, defaults, validations.  
- Set derived fields with formulas referencing other fields.  
- Save your form by entering a form name; it will be stored in localStorage.

### Preview Form (`/preview`)

- Interact with the form like an end user.  
- Input validation and error feedback occur in real-time.  
- Derived fields automatically update as inputs change.

### My Forms (`/myforms`)

- View a list of all saved forms with their creation dates.  
- Click on a form to open its preview page.

---

## Future Improvements

- Add form export/import functionality (JSON)  
- Enhance formula editor with syntax highlighting and error detection  
- Add user authentication and backend persistence  
- Provide form submission endpoints and integrate with APIs  
- Improve UI responsiveness and accessibility




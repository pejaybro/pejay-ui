# pejay-ui CLI Commands

A lightweight CLI tool to initialize, add, and remove React UI components in your projects.

## Commands

### 1. Initialize Configuration
Initialize the configuration file `pejay-ui.json` in the root of your project.
```bash
npx pejay-ui init
```

### 2. Add Component
Download and install a component, automatically setting up its utilities (like `cn`) and resolving component-to-component dependencies.
```bash
npx pejay-ui add <component-name>
```
*Example:* `npx pejay-ui add button` or `npx pejay-ui add form/date-picker`

### 3. Remove Component
Safely delete a component's files, and clean up any unused utilities or package dependencies that were installed with it.
```bash
npx pejay-ui remove <component-name>
```
*Example:* `npx pejay-ui remove button`

---

## Available Components

Below is the list of components you can add to your project using the `add` command:

### Buttons
* **`button`**: Premium interactive button supporting multiple variants (solid, soft, ghost), loaders, and custom hover tooltips.

### Form Inputs
* **`form/input`**: Standard text input field with validation, labels, and error messaging.
* **`form/amount-input`**: Numeric input configured for currency entry with symbol prefixes and formatting.
* **`form/checkbox`**: Styled single checkbox input.
* **`form/checkbox-group`**: Group of checkboxes managing single or multiple selection states with item indices.
* **`form/email-input`**: Dedicated input for email addresses with prefix icon.
* **`form/file-input`**: Premium dropzone-style file upload component supporting drag-and-drop and progress/preview states.
* **`form/number-input`**: Input field for numerical values with increment/decrement steppers.
* **`form/password-input`**: Secure text input with eye icon toggle to show/hide the password.
* **`form/phone-input`**: Formatted input field for telephone numbers.
* **`form/radio`**: Styled radio selection dot.
* **`form/radio-group`**: Group of mutually exclusive radio options.
* **`form/range-slider`**: Slider controls for choosing values from a numeric range.
* **`form/switch`**: Styled toggle switch representing boolean options.
* **`form/textarea`**: Multiline text area input with character counter/limit indicators.
* **`form/url-input`**: Styled input field specifically formatted for web addresses/links.

### Date & Time Pickers
* **`form/date-picker`**: Calendar-based date selector popover with inline month/year dropdowns.
* **`form/date-range-picker`**: Date range selector to pick start and end dates with highlight ranges.
* **`form/time-picker`**: Dropdown component for picking specific hours, minutes, and AM/PM.
* **`form/time-range-picker`**: Popover time selector for configuring custom duration intervals.

### Dropdowns & Selects
* **`dropdown/select-input`**: Elegant single-select searchable dropdown input.
* **`dropdown/multiselect-input`**: Searchable multiselect dropdown which renders selected options as dismissible tag pills.

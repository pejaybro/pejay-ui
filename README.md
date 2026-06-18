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

Below is the list of components you can add. Each has a copyable command block with a working native copy button on GitHub and NPM:

### Buttons

* **`button`**: Premium interactive button supporting multiple variants (solid, soft, ghost), loaders, and custom hover tooltips.
  ```bash
  npx pejay-ui add button
  ```

### Form Inputs

* **`form/input`**: Standard text input field with validation, labels, and error messaging.
  ```bash
  npx pejay-ui add form/input
  ```
* **`form/amount-input`**: Numeric input configured for currency entry with symbol prefixes and formatting.
  ```bash
  npx pejay-ui add form/amount-input
  ```
* **`form/checkbox`**: Styled single checkbox input.
  ```bash
  npx pejay-ui add form/checkbox
  ```
* **`form/checkbox-group`**: Group of checkboxes managing single or multiple selection states with item indices.
  ```bash
  npx pejay-ui add form/checkbox-group
  ```
* **`form/email-input`**: Dedicated input for email addresses with prefix icon.
  ```bash
  npx pejay-ui add form/email-input
  ```
* **`form/file-input`**: Premium dropzone-style file upload component supporting drag-and-drop and progress/preview states.
  ```bash
  npx pejay-ui add form/file-input
  ```
* **`form/number-input`**: Input field for numerical values with increment/decrement steppers.
  ```bash
  npx pejay-ui add form/number-input
  ```
* **`form/password-input`**: Secure text input with eye icon toggle to show/hide the password.
  ```bash
  npx pejay-ui add form/password-input
  ```
* **`form/phone-input`**: Formatted input field for telephone numbers.
  ```bash
  npx pejay-ui add form/phone-input
  ```
* **`form/radio`**: Styled radio selection dot.
  ```bash
  npx pejay-ui add form/radio
  ```
* **`form/radio-group`**: Group of mutually exclusive radio options.
  ```bash
  npx pejay-ui add form/radio-group
  ```
* **`form/range-slider`**: Slider controls for choosing values from a numeric range.
  ```bash
  npx pejay-ui add form/range-slider
  ```
* **`form/switch`**: Styled toggle switch representing boolean options.
  ```bash
  npx pejay-ui add form/switch
  ```
* **`form/textarea`**: Multiline text area input with character counter/limit indicators.
  ```bash
  npx pejay-ui add form/textarea
  ```
* **`form/url-input`**: Styled input field specifically formatted for web addresses/links.
  ```bash
  npx pejay-ui add form/url-input
  ```

### Date & Time Pickers

* **`form/date-picker`**: Calendar-based date selector popover with inline month/year dropdowns.
  ```bash
  npx pejay-ui add form/date-picker
  ```
* **`form/date-range-picker`**: Date range selector to pick start and end dates with highlight ranges.
  ```bash
  npx pejay-ui add form/date-range-picker
  ```
* **`form/time-picker`**: Dropdown component for picking specific hours, minutes, and AM/PM.
  ```bash
  npx pejay-ui add form/time-picker
  ```
* **`form/time-range-picker`**: Popover time selector for configuring custom duration intervals.
  ```bash
  npx pejay-ui add form/time-range-picker
  ```

### Dropdowns & Selects

* **`dropdown/select-input`**: Elegant single-select searchable dropdown input.
  ```bash
  npx pejay-ui add dropdown/select-input
  ```
* **`dropdown/multiselect-input`**: Searchable multiselect dropdown which renders selected options as dismissible tag pills.
  ```bash
  npx pejay-ui add dropdown/multiselect-input
  ```

### Layouts

* **`layouts/lv1`**: A responsive, collapsible sidebar-based application layout.
  ```bash
  npx pejay-ui add layouts/lv1
  ```

### Scaffolds & Templates

* **`tanstack-query-client`**: Bare-bone TanStack Query client and context provider setup, copied directly into your project's `src/tanstack-query/`.
  ```bash
  npx pejay-ui add tanstack-query-client
  ```
* **`react-router-client`**: Bare-bone React Router client layout, routing structure, and route guard setup, copied into `src/react-router/`.
  ```bash
  npx pejay-ui add react-router-client
  ```
* **`tanstack-router-client`**: TanStack Router setup with layouts, route guards, and file-based route stubs, copied into `src/tanstack-router/`.
  ```bash
  npx pejay-ui add tanstack-router-client
  ```
* **`axios-client`**: Axios instance with interceptors, request helpers, and a sample API module, copied into `src/axios/`.
  ```bash
  npx pejay-ui add axios-client
  ```
* **`redux-store-client`**: Redux Toolkit store setup with `redux-persist`, reducers, slices, and selectors, copied into `src/redux-store/`.
  ```bash
  npx pejay-ui add redux-store-client
  ```
* **`rtk-query-client`**: RTK Query base API with `fetchBaseQuery`, tag management, middleware, and a sample endpoint, copied into `src/rtk-query/`.
  ```bash
  npx pejay-ui add rtk-query-client
  ```

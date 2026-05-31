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

Here is the list of components. You can copy the command using the **Copy** button on the right:

<table>
  <thead>
    <tr>
      <th>Component</th>
      <th>Description</th>
      <th>Install Command</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <!-- Buttons -->
    <tr>
      <td><strong>button</strong></td>
      <td>Premium interactive button with multiple variants, loaders, and tooltips.</td>
      <td><code>npx pejay-ui add button</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add button')">Copy</button></td>
    </tr>
    <!-- Form Inputs -->
    <tr>
      <td><strong>form/input</strong></td>
      <td>Standard text input field with labels and validation errors.</td>
      <td><code>npx pejay-ui add form/input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/amount-input</strong></td>
      <td>Numeric input configured for formatted currency entry.</td>
      <td><code>npx pejay-ui add form/amount-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/amount-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/checkbox</strong></td>
      <td>Styled single checkbox input.</td>
      <td><code>npx pejay-ui add form/checkbox</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/checkbox')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/checkbox-group</strong></td>
      <td>Group of checkboxes managing single/multiple selection states.</td>
      <td><code>npx pejay-ui add form/checkbox-group</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/checkbox-group')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/email-input</strong></td>
      <td>Dedicated input for email addresses with prefix icon.</td>
      <td><code>npx pejay-ui add form/email-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/email-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/file-input</strong></td>
      <td>Premium dropzone-style file upload component.</td>
      <td><code>npx pejay-ui add form/file-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/file-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/number-input</strong></td>
      <td>Input field for numerical values with increment/decrement steppers.</td>
      <td><code>npx pejay-ui add form/number-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/number-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/password-input</strong></td>
      <td>Secure text input with eye icon toggle to show/hide password.</td>
      <td><code>npx pejay-ui add form/password-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/password-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/phone-input</strong></td>
      <td>Formatted input field for telephone numbers.</td>
      <td><code>npx pejay-ui add form/phone-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/phone-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/radio</strong></td>
      <td>Styled radio selection dot.</td>
      <td><code>npx pejay-ui add form/radio</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/radio')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/radio-group</strong></td>
      <td>Group of mutually exclusive radio options.</td>
      <td><code>npx pejay-ui add form/radio-group</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/radio-group')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/range-slider</strong></td>
      <td>Slider controls for choosing values from a numeric range.</td>
      <td><code>npx pejay-ui add form/range-slider</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/range-slider')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/switch</strong></td>
      <td>Styled toggle switch representing boolean options.</td>
      <td><code>npx pejay-ui add form/switch</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/switch')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/textarea</strong></td>
      <td>Multiline text area input with character counter/limits.</td>
      <td><code>npx pejay-ui add form/textarea</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/textarea')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/url-input</strong></td>
      <td>Styled input field specifically formatted for web addresses.</td>
      <td><code>npx pejay-ui add form/url-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/url-input')">Copy</button></td>
    </tr>
    <!-- Date & Time Pickers -->
    <tr>
      <td><strong>form/date-picker</strong></td>
      <td>Calendar-based date selector popover with inline selects.</td>
      <td><code>npx pejay-ui add form/date-picker</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/date-picker')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/date-range-picker</strong></td>
      <td>Date range selector to pick start and end dates.</td>
      <td><code>npx pejay-ui add form/date-range-picker</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/date-range-picker')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/time-picker</strong></td>
      <td>Dropdown component for picking hours, minutes, and AM/PM.</td>
      <td><code>npx pejay-ui add form/time-picker</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/time-picker')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>form/time-range-picker</strong></td>
      <td>Popover time selector for configuring custom duration intervals.</td>
      <td><code>npx pejay-ui add form/time-range-picker</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add form/time-range-picker')">Copy</button></td>
    </tr>
    <!-- Dropdowns & Selects -->
    <tr>
      <td><strong>dropdown/select-input</strong></td>
      <td>Elegant single-select searchable dropdown input.</td>
      <td><code>npx pejay-ui add dropdown/select-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add dropdown/select-input')">Copy</button></td>
    </tr>
    <tr>
      <td><strong>dropdown/multiselect-input</strong></td>
      <td>Searchable multiselect dropdown with dismissible tag pills.</td>
      <td><code>npx pejay-ui add dropdown/multiselect-input</code></td>
      <td><button onclick="navigator.clipboard.writeText('npx pejay-ui add dropdown/multiselect-input')">Copy</button></td>
    </tr>
  </tbody>
</table>

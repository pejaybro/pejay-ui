### Sanitize Data (`sanitize-fn`)

- **Description**: Recursively trims string values, nullifies empty strings, and checks for empty payloads in form data.

- **Exported Functions**:
  - `sanitizeFormData({ data, skip, nullifyEmptyStrings })`
    - Sanitizes an entire object and returns:
      ```ts
      {
        isEmpty: boolean;
        data: T;
      }
      ```
    - Supports nested field exclusion using dot notation (e.g. `"user.email"`).
    - Optionally preserves empty strings by setting `nullifyEmptyStrings` to `false`.

- **Features**
  - Trims leading and trailing whitespace from strings.
  - Converts empty strings to `null` (configurable).
  - Supports nested objects and arrays.
  - Supports skipping specific fields using dot notation.
  - Preserves `Date` and `File` instances.
  - Returns an `isEmpty` flag for quick form validation.
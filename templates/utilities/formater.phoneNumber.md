
### Phone Number Formatter (`phone-number-formatter`)

- **Description**: Parses, validates, and formats phone numbers using `libphonenumber-js`. Supports national and international numbers, country-based parsing, country calling code prefixes, and graceful handling of invalid or placeholder values.

- **Exported Functions**:
  - `setPhoneNumberFormat({ number, country, countryCode })`
    - Formats valid phone numbers to their national format.
    - Supports parsing using:
      - Existing international numbers (`+1234567890`)
      - Country calling codes (`+1`, `+91`, etc.)
      - ISO country codes (`US`, `IN`, etc.)
    - Returns `null` for:
      - `null`
      - `undefined`
      - Empty strings
      - Placeholder values such as `"null"`, `"undefined"`, and `"-"`
    - Returns the original value when:
      - The phone number is invalid
      - Parsing fails
    - Prioritizes parsing in the following order:
      1. Number already contains `+`
      2. `countryCode`
      3. `country`
      
- **Features**
  - Supports both string and numeric inputs.
  - Handles national and international phone numbers.
  - Supports ISO country codes and country calling codes.
  - Safely handles null, undefined, and placeholder values.
  - Returns original input for invalid or unparsable numbers.
  - Formats valid numbers using `formatNational()`.
### Date Time Formatter (`date-time-formatter`)

- **Description**: Validates, parses, formats, and compares dates/times using `dayjs`. All formatting and standard comparisons are normalized to the browser/app timezone detected via `dayjs.tz.guess()`.

- **Exported Functions**:

  - `setDateFormat({ input, mode, customformat })`
    - Formats supported date inputs into:
      - `DD/MM/YYYY` (`date`)
      - `hh:mm A` (`time`)
      - `DD/MM/YYYY hh:mm A` (`datetime`)
      - Custom formats via `customformat`
    - Returns `null` for invalid inputs.

  - `compareDates({ input, compareTo, mode })`
    - Compares two valid dates and returns:
      ```ts
      {
        isSame: boolean;
        isBefore: boolean;
        isAfter: boolean;
      }
      ```
    - Supported comparison modes:
      - `timestamp`
      - `time`
      - `utc-time`
      - `day`
      - `week`
      - `month`
      - `year`
    - Returns `null` if either date is invalid.

- **Supported Inputs**
  - `dayjs()`
  - `new Date()`
  - Unix timestamp (milliseconds)
  - `YYYY-MM-DD`
  - `YYYY-MM-DDTHH:mm`
  - `YYYY-MM-DDTHH:mm:ss`
  - `YYYY-MM-DDTHH:mm:ss.SSS`
  - ISO strings with timezone offsets:
    - `YYYY-MM-DDTHH:mm:ssZ`
    - `YYYY-MM-DDTHH:mm:ss+05:30`
    - `YYYY-MM-DDTHH:mm:ss-04:00`

- **Comparison Modes**
  - `timestamp`
    - Compares exact timestamps (milliseconds since epoch).

  - `time`
    - Compares local wall-clock time after timezone conversion.
    - Ignores date portion.

  - `utc-time`
    - Compares UTC clock time directly.
    - Ignores date portion.

  - `day`, `week`, `month`, `year`
    - Uses Day.js unit-based comparisons.

- **Timezone Behavior**
  - Formatting is performed in the browser/app timezone (`dayjs.tz.guess()`).
  - `time` compares local clock times after timezone normalization.
  - `utc-time` compares UTC clock times without local timezone influence.
  - ISO strings containing timezone offsets are automatically converted to the local timezone before formatting and standard comparisons.

- **Features**
  - Strict input validation.
  - Browser timezone normalization.
  - Local and UTC time-only comparison modes.
  - Custom date formatting support.
  - Supports Dayjs, Date, Unix timestamps, and ISO date strings.
  - Safe null handling for invalid inputs.
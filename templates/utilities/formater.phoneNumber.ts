import { parsePhoneNumberWithError, type CountryCode } from "libphonenumber-js";

/* ------------------------------------------------
 ? Types & Interfaces
 ------------------------------------------------*/
type PhoneFormatterArgs = {
  number: string | number | null | undefined;
  country?: CountryCode;
  countryCode?: string; // +1, +91, etc.
};

/* ------------------------------------------------
 ? Main function
 @param- number: Phone number to be formatted
 @param- country: Country code
 @param- countryCode: Country calling code
 @returns - Formatted phone number

 *usage Type 1 (Use country code)

 setPhoneNumberFormat({
  number: "4165551234",
  country: "US",
  countryCode: "+1",
 });

 *useage Type 2 (Country code is provided)

 setPhoneNumberFormat({
  number: "4165551234",
  countryCode: "+1",
 });

*useage Type 3 (only country is provided)

setPhoneNumberFormat({
  number: "4165551234",
  country: "IN",
});

*useage Type 4 (Number already contains + ignore country code)

setPhoneNumberFormat({
  number: "+14165551234",
  country: "IN",
});



*useage Type 5 (Number already contains + so no need to provide country code)

setPhoneNumberFormat({
  number: "+14165551234",
});

*usage Type 6 (null is provided)

setPhoneNumberFormat({
  number: null,
});

*usage Type 7 (undefined is provided)

setPhoneNumberFormat({
  number: undefined,
});


*usage Type 8 (placeholder value is provided)

setPhoneNumberFormat({
  number: "-",
});

*usage Type 9 (invalid number)

setPhoneNumberFormat({
  number: "abc",
});

*usage Type 10 (unformatted number)

setPhoneNumberFormat({
  number: "1234",
});

------------------------------------------------*/
export function setPhoneNumberFormat({
  number,
  country,
  countryCode,
}: PhoneFormatterArgs): string | null {
  // Handle nullish values
  if (number == null) return null;
  const strNum = String(number).trim();

  // Handle common placeholder values
  if (!strNum || ["null", "undefined", "-"].includes(strNum.toLowerCase())) {
    return null;
  }

  try {
    let phoneInput = strNum;

    /**
     * NOTE : Priority:
     * 1. Number already contains '+'
     * 2. countryCode
     * 3. country
     */

    if (!phoneInput.startsWith("+") && countryCode) {
      phoneInput = `${countryCode}${phoneInput}`;
    }

    const phone = phoneInput.startsWith("+")
      ? parsePhoneNumberWithError(phoneInput)
      : parsePhoneNumberWithError(phoneInput, country);

    if (!phone.isValid()) {
      return strNum;
    }

    return phone.formatNational();
  } catch {
    return strNum;
  }
}

/* 

*what number can handel as input 

1. null/undefined      -> null
2. "", "null", "-"     -> null
3. Number starts "+"   -> parse as international
4. countryCode         -> prepend and parse
5. country             -> parse as national
6. Valid number        -> formatNational()
7. Invalid number      -> return original value
8. Parse error         -> return original value

*/

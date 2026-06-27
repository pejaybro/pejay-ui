/* ------------------------------------------------
 ? Types & Interfaces
 ------------------------------------------------*/
type SanitizeFormDataOptions<T> = {
  data: T;
  skip?: string[];
  nullifyEmptyStrings?: boolean;
};

type SanitizeFormDataResult<T> = {
  isEmpty: boolean;
  data: T;
};

/* ------------------------------------------------
 ? Main function
 @param - data: Object to be sanitized
 @param - skip: Array of keys to skip
 @param - nullifyEmptyStrings: Whether to nullify empty strings
 @returns - Sanitized object

 *usage Type 1

 const {isEmpty,data:sanitizedData} = sanitizeFormData({data});

 if(isEmpty){
  return;
 }

 *usage Type 2 
 const {isEmpty,data:sanitizedData} = sanitizeFormData({data, skip:["password","user.email",]});
 
 if(isEmpty){
  return;
 }

 # NOTE : skip contains dot notation for nested objects and key names whose value will skip from sanitizing

 *usage Type 3
 const {isEmpty,data:sanitizedData} = sanitizeFormData({data, skip:["password","user.email",], nullifyEmptyStrings:false});

 if(isEmpty){
  return;
 }

 
 ------------------------------------------------*/
export const sanitizeFormData = <T>({
  data,
  skip = [],
  nullifyEmptyStrings = true,
}: SanitizeFormDataOptions<T>): SanitizeFormDataResult<T> => {
  const skipSet = new Set(skip);
  const sanitizedData = sanitize(data, "", skipSet, nullifyEmptyStrings) as T;
  return {
    isEmpty: isEmptyValue(sanitizedData),
    data: sanitizedData,
  };
};

/* ------------------------------------------------
 # ANCHOR : Helper Functions
 ------------------------------------------------*/

/* ------------------------------------------------
 ? Recursive Function
 @param - value: Value to be sanitized
 @param - path: Path of the value
 @param - skipSet: Set of keys to skip
 @param - nullifyEmptyStrings: Whether to nullify empty strings
 @returns - Sanitized value
 ------------------------------------------------*/
export function sanitize(
  value: unknown,
  path = "",
  skipSet: Set<string>,
  nullifyEmptyStrings: boolean,
): unknown {
  // Strings
  if (typeof value === "string") {
    if (skipSet.has(path)) {
      return value;
    }

    const trimmed = value.trim();

    return nullifyEmptyStrings && trimmed === "" ? null : trimmed;
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitize(item, `${path}[${index}]`, skipSet, nullifyEmptyStrings),
    );
  }

  // Plain Objects
  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    !(value instanceof File)
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        sanitize(
          val,
          path ? `${path}.${key}` : key,
          skipSet,
          nullifyEmptyStrings,
        ),
      ]),
    );
  }

  return value;
}

/* ------------------------------------------------
 ? Check if value is empty
 @param - value: Value to be checked
 @returns - boolean
 ------------------------------------------------*/
export function isEmptyValue(value: unknown): boolean {
  if (value === null) return true;

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmptyValue);
  }

  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    !(value instanceof File)
  ) {
    const values = Object.values(value);

    return values.length === 0 || values.every(isEmptyValue);
  }

  return false;
}

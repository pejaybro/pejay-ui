import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Link, CheckCircle2, AlertCircle } from "lucide-react";

interface URLInputProps extends React.ComponentProps<typeof Input> {
  showValidationIcon?: boolean;
}

/**
 * Validates common URL formats:
 * - https://www.google.com
 * - http://example.com/path?query=1
 * - example.com (supports missing protocol)
 * - 127.0.0.1 (IP addresses)
 * - sub.domain.co.uk/file.pdf
 */
const validateURL = (url: string) => {
  if (!url) return false;
  try {
    // Simple regex for URL validation
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", // fragment locator
      "i"
    );
    return pattern.test(url);
  } catch (e) {
    return false;
  }
};

export const URLInput = ({
  showValidationIcon = true,
  onChange,
  className,
  ...props
}: URLInputProps) => {
  const [value, setValue] = useState((props.value as string) || "");
  const [isValid, setIsValid] = useState(validateURL((props.value as string) || ""));

  useEffect(() => {
    const newVal = (props.value as string) || "";
    setValue(newVal);
    setIsValid(validateURL(newVal));
  }, [props.value]);

  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    setIsValid(validateURL(val));
    onChange?.(e);
  };

  return (
    <Input
      autoComplete="url"
      type="url"
      leftIcon={<Link size={18} />}
      {...props}
      value={value}
      onChange={handleInternalChange}
      rightIcon={
        showValidationIcon && value ? (
          isValid ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : (
            <AlertCircle size={18} className="text-amber-500" />
          )
        ) : (
          props.rightIcon
        )
      }
      className={className}
     
    />
  );
};

export type ExpirationFieldProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  hasError?: boolean;
};

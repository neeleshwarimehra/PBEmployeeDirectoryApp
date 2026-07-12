export const validateEmail = (email?: string): boolean => {
  if (!email) return false;

  return !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const isGovEmail = (email?: string): boolean => {
  if (!email || !validateEmail(email)) {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();

  return (
    normalizedEmail.endsWith("gov.in") || normalizedEmail.endsWith("nic.in")
  );
};

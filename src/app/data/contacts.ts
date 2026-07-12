export interface Contact {
  Name: string;
  Mobile: string | null;
  Email: string;
  DesignationId: number;
  DesignationName: string;
  StationId: number;
  StationName: string;
}

export const mockContacts: Contact[] = [];

export const recentContacts = mockContacts.slice(0, 4);

// Function to get contact by email
export function getContactByEmail(Email: string): Contact | undefined {
  // console.log("getContactByEmail - Email NNNN:", Email);
  return mockContacts.find((contact) => contact.Email === Email);
}
// console.log(getContactByEmail("employee30@example.com"));
// Function to filter contacts by search query
export function searchContacts(query: string, contacts: Contact[]): Contact[] {
  const lowerQuery = query.toLowerCase();
  return contacts.filter(
    (contact) =>
      contact.Name.toLowerCase().includes(lowerQuery) ||
      contact.DesignationName.toLowerCase().includes(lowerQuery) ||
      contact.StationName.toLowerCase().includes(lowerQuery) ||
      contact.Mobile?.toLowerCase().includes(lowerQuery),
  );
}

// Function to filter contacts by department
export function filterByDepartment(
  department: string,
  contacts: Contact[],
): Contact[] {
  if (department === "All") return contacts;
  return contacts.filter((contact) => contact.StationName === department);
}

// Function to filter contacts by designation
export function filterByDesignation(
  designation: string,
  contacts: Contact[],
): Contact[] {
  if (designation === "All") return contacts;
  return contacts.filter((contact) => contact.DesignationName === designation);
}

// Function to filter contacts by office location
export function filterByOffice(office: string, contacts: Contact[]): Contact[] {
  if (office === "All") return contacts;
  return contacts.filter((contact) => contact.StationName === office);
}

// Unique sorted designations
export const allDesignations = [
  "All",
  ...Array.from(new Set(mockContacts.map((c) => c.DesignationName))).sort(),
];
// console.log("All Designations:", allDesignations);

// Unique sorted offices
export const allOffices = [
  "All",
  ...Array.from(new Set(mockContacts.map((c) => c.StationName))).sort(),
];
// console.log("All Offices:", allOffices);
// Function to sort contacts alphabetically
export function sortContactsAlphabetically(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => a.Name.localeCompare(b.Name));
}

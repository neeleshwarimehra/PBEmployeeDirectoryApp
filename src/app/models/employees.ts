export interface EmployeeProfile {
  EmployeeId: number;
  Name: string;
  Mobile: string;
  Email: string;
  DesignationId: number;
  DesignationName: string;
  StationId: number;
  StationName: string;
}

export interface Employees {
  EmpCode: number;
  Name: string;
  DOB?: string;
  Mobile: string;
  Email: string;
  DesignationId: number;
  DesignationName: string;
  StationId: number;
  StationName: string;
}

export interface Designations {
  Id: number;
  Name: string;
}

export interface Stations {
  StationId: number;
  StationName: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  empprofile: EmployeeProfile;
  employees: Employees[];
  designations: Designations[];
  stations: Stations[];
}

export interface EmployeesOLD {
  Name: string;
  Mobile: string;
  Email: string;
  DesignationId: number;
  DesignationName: string;
  StationId: number;
  StationName: string;
}

type SearchResponse = {
  success: boolean;
  totalRecords: number;
  data: Employees[];
};

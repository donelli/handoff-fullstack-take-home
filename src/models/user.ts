export enum UserType {
  CONTRACTOR = "CONTRACTOR",
  HOMEOWNER = "HOMEOWNER",
}

export type User = {
  id: number;
  type: UserType;
  name: string;
};

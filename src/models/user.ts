export enum UserType {
  CONTRACTOR = "CONTRACTOR",
  HOMEOWNER = "HOMEOWNER",
}

export type User = {
  type: UserType;
  name: string;
};

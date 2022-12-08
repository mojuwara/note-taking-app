/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateDirectoryInput = {
  user: string,
  directory?: string | null,
};

export type ModelDirectoryConditionInput = {
  directory?: ModelStringInput | null,
  and?: Array< ModelDirectoryConditionInput | null > | null,
  or?: Array< ModelDirectoryConditionInput | null > | null,
  not?: ModelDirectoryConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Directory = {
  __typename: "Directory",
  user: string,
  directory?: string | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateDirectoryInput = {
  user: string,
  directory?: string | null,
};

export type DeleteDirectoryInput = {
  user: string,
};

export type ModelDirectoryFilterInput = {
  user?: ModelIDInput | null,
  directory?: ModelStringInput | null,
  and?: Array< ModelDirectoryFilterInput | null > | null,
  or?: Array< ModelDirectoryFilterInput | null > | null,
  not?: ModelDirectoryFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelDirectoryConnection = {
  __typename: "ModelDirectoryConnection",
  items:  Array<Directory | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionDirectoryFilterInput = {
  user?: ModelSubscriptionIDInput | null,
  directory?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDirectoryFilterInput | null > | null,
  or?: Array< ModelSubscriptionDirectoryFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type CreateDirectoryMutationVariables = {
  input: CreateDirectoryInput,
  condition?: ModelDirectoryConditionInput | null,
};

export type CreateDirectoryMutation = {
  createDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateDirectoryMutationVariables = {
  input: UpdateDirectoryInput,
  condition?: ModelDirectoryConditionInput | null,
};

export type UpdateDirectoryMutation = {
  updateDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteDirectoryMutationVariables = {
  input: DeleteDirectoryInput,
  condition?: ModelDirectoryConditionInput | null,
};

export type DeleteDirectoryMutation = {
  deleteDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetDirectoryQueryVariables = {
  user: string,
};

export type GetDirectoryQuery = {
  getDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListDirectoriesQueryVariables = {
  user?: string | null,
  filter?: ModelDirectoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListDirectoriesQuery = {
  listDirectories?:  {
    __typename: "ModelDirectoryConnection",
    items:  Array< {
      __typename: "Directory",
      user: string,
      directory?: string | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateDirectorySubscriptionVariables = {
  filter?: ModelSubscriptionDirectoryFilterInput | null,
  owner?: string | null,
};

export type OnCreateDirectorySubscription = {
  onCreateDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateDirectorySubscriptionVariables = {
  filter?: ModelSubscriptionDirectoryFilterInput | null,
  owner?: string | null,
};

export type OnUpdateDirectorySubscription = {
  onUpdateDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteDirectorySubscriptionVariables = {
  filter?: ModelSubscriptionDirectoryFilterInput | null,
  owner?: string | null,
};

export type OnDeleteDirectorySubscription = {
  onDeleteDirectory?:  {
    __typename: "Directory",
    user: string,
    directory?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

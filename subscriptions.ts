/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDirectories = /* GraphQL */ `
  subscription OnCreateDirectories(
    $filter: ModelSubscriptionDirectoriesFilterInput
    $owner: String
  ) {
    onCreateDirectories(filter: $filter, owner: $owner) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateDirectories = /* GraphQL */ `
  subscription OnUpdateDirectories(
    $filter: ModelSubscriptionDirectoriesFilterInput
    $owner: String
  ) {
    onUpdateDirectories(filter: $filter, owner: $owner) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteDirectories = /* GraphQL */ `
  subscription OnDeleteDirectories(
    $filter: ModelSubscriptionDirectoriesFilterInput
    $owner: String
  ) {
    onDeleteDirectories(filter: $filter, owner: $owner) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;

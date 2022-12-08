/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDirectory = /* GraphQL */ `
  subscription OnCreateDirectory(
    $filter: ModelSubscriptionDirectoryFilterInput
    $owner: String
  ) {
    onCreateDirectory(filter: $filter, owner: $owner) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateDirectory = /* GraphQL */ `
  subscription OnUpdateDirectory(
    $filter: ModelSubscriptionDirectoryFilterInput
    $owner: String
  ) {
    onUpdateDirectory(filter: $filter, owner: $owner) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteDirectory = /* GraphQL */ `
  subscription OnDeleteDirectory(
    $filter: ModelSubscriptionDirectoryFilterInput
    $owner: String
  ) {
    onDeleteDirectory(filter: $filter, owner: $owner) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;

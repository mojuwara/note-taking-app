/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDirectory = /* GraphQL */ `
  mutation CreateDirectory(
    $input: CreateDirectoryInput!
    $condition: ModelDirectoryConditionInput
  ) {
    createDirectory(input: $input, condition: $condition) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateDirectory = /* GraphQL */ `
  mutation UpdateDirectory(
    $input: UpdateDirectoryInput!
    $condition: ModelDirectoryConditionInput
  ) {
    updateDirectory(input: $input, condition: $condition) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteDirectory = /* GraphQL */ `
  mutation DeleteDirectory(
    $input: DeleteDirectoryInput!
    $condition: ModelDirectoryConditionInput
  ) {
    deleteDirectory(input: $input, condition: $condition) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;

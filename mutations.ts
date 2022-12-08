/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDirectories = /* GraphQL */ `
  mutation CreateDirectories(
    $input: CreateDirectoriesInput!
    $condition: ModelDirectoriesConditionInput
  ) {
    createDirectories(input: $input, condition: $condition) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateDirectories = /* GraphQL */ `
  mutation UpdateDirectories(
    $input: UpdateDirectoriesInput!
    $condition: ModelDirectoriesConditionInput
  ) {
    updateDirectories(input: $input, condition: $condition) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteDirectories = /* GraphQL */ `
  mutation DeleteDirectories(
    $input: DeleteDirectoriesInput!
    $condition: ModelDirectoriesConditionInput
  ) {
    deleteDirectories(input: $input, condition: $condition) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;

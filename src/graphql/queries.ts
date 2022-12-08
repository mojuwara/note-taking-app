/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDirectory = /* GraphQL */ `
  query GetDirectory($user: ID!) {
    getDirectory(user: $user) {
      user
      directory
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listDirectories = /* GraphQL */ `
  query ListDirectories(
    $user: ID
    $filter: ModelDirectoryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDirectories(
      user: $user
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        user
        directory
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

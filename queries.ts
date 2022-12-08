/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDirectories = /* GraphQL */ `
  query GetDirectories($id: ID!) {
    getDirectories(id: $id) {
      user
      directory
      id
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listDirectories = /* GraphQL */ `
  query ListDirectories(
    $filter: ModelDirectoriesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDirectories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        user
        directory
        id
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

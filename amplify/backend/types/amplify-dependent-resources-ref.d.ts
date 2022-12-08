export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "notetakingappb1f80783": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "storage": {
        "StudyBuddyFileStorage": {
            "BucketName": "string",
            "Region": "string"
        }
    },
    "api": {
        "StudyBuddyDirGraphqlAPI": {
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    }
}
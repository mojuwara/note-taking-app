import os
import json
import boto3
import logging

client = boto3.client('dynamodb')
logger = logging.getLogger(__name__)

def handler(event, context):
	action = event["queryStringParameters"].get("action")
	logger.info(f"Processing event with {action=}")

	if action == "putDir":
		return putDir(event)
	elif action == "getDir":
		return getDir(event)

	return {
		'statusCode'    : 400,
		'body'          : 'Invalid request',
		'headers'       : {
			'Content-Type'                  : 'application/json',
			'Access-Control-Allow-Origin'   : '*'
		},
	}

def putDir(event):
	"""Insert/Update user directory in DynamoDB"""
	body = json.loads(event["body"])
	userID, userDir = body.get("userID"), body.get("userDir")
	logger.info(f"Updating directory for {userID=}")
	if not userID or not userDir:
		return {
			'statusCode'    : 400,
			'body'          : json.dumps({'message': f'Could not update directory. Check {userID=} and {userDir=}'}),
			'headers'       : {
				'Content-Type'                  : 'application/json',
				'Access-Control-Allow-Origin'   : '*'
			},
		}

	client.put_item(
		TableName=os.environ["DIR_TABLE"],
		Item={
			'userID': {'S': userID},
			'userDir': {'S': userDir},
		}
	)

	response = {
		'statusCode'    : 200,
		'body'			: json.dumps({'message': 'Successfully created item!', }),
		'headers'       : {
			'Content-Type'                  : 'application/json',
			'Access-Control-Allow-Origin'   : '*'
		},
	}

	return response

def getDir(event):
	"""Fetch a users directory from DynamoDB"""
	userID = event["queryStringParameters"].get("userID")
	logger.info(f"Getting directory for {userID=}")
	if not userID:
		return {
			'statusCode'    : 400,
			'body'          : json.dumps({'message': f'Unable to fetch user directory for {userID=}'}),
			'headers'       : {
				'Content-Type'                  : 'application/json',
				'Access-Control-Allow-Origin'   : '*'
			},
		}

	data = client.get_item(
		TableName=os.environ["DIR_TABLE"],
		Key={ 'userID': { 'S': userID } }
	)

	response = {
		'statusCode'    : 200,
		'body'          : json.dumps(data),
		'headers'       : {
			'Content-Type'                  : 'application/json',
			'Access-Control-Allow-Origin'   : '*'
		},
	}

	return response

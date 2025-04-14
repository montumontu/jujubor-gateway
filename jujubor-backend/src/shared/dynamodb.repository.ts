import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand, DeleteCommandInput, DeleteCommandOutput, DynamoDBDocumentClient,
  GetCommand, GetCommandInput, GetCommandOutput, PutCommand, PutCommandInput, PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand, ScanCommandInput, ScanCommandOutput, UpdateCommand, UpdateCommandInput, UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import logger from './logger.service';

/**
 * The repo for Dynamo DB Document used by the application
 */
export class DynamoDBDocumentRepository {
  private static instance: DynamoDBDocumentRepository;
  private dynamoDBDocumentClient: DynamoDBDocumentClient;

  constructor() {
    const dynamoDBClient = new DynamoDBClient({});
    this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  public static getInstance(): DynamoDBDocumentRepository {
    if (!DynamoDBDocumentRepository.instance) {
      DynamoDBDocumentRepository.instance = new DynamoDBDocumentRepository();
    }
    return DynamoDBDocumentRepository.instance;
  }


  /**
* Scans the contents from DynamoDB
* @param  {string} tableName The table from which the contents need to be retrieved
* @param  {string} [filterExpression] Optional filter expression
* @param  {string[]} [projectionExpression] Optional projection expression for attributes to retrieve
* @param  {Record<string, string>} [expressionAttributeNames] Optional attribute names mapping, only if reserved keywords are used
* @param  {number} [limit] Optional limit for the number of items to retrieve
* @return {Promise<ScanCommandOutput>} The table contents
*/
  async scan(
    tableName: string,
    limit?: number,
    filterExpression?: string,
    projectionExpression?: string[],
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>,
  ): Promise<ScanCommandOutput> {

    const params: ScanCommandInput = {
      TableName: tableName,
      ReturnConsumedCapacity: 'TOTAL',
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }

    if (projectionExpression && projectionExpression.length > 0) {
      params.ProjectionExpression = projectionExpression.join(', ');
    }

    if (expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (expressionAttributeValues && Object.keys(expressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    if (limit) {
      params.Limit = limit;
    }

    const command = new ScanCommand(params);

    return this.dynamoDBDocumentClient.send(command);
  }

  async getItem(
    tableName: string,
    key: Record<string, any>,
    attributesToGet?: string[],
    expressionAttributeNames?: Record<string, string>,
  ): Promise<GetCommandOutput> {
    logger.info(`Retrieving item from DynamoDB table: ${ tableName }`, { key });

    const params: GetCommandInput = {
      Key: key,
      TableName: tableName,
    };

    if (expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (attributesToGet && attributesToGet.length > 0) {
      params.ProjectionExpression = attributesToGet.join(', ');
    }

    const command = new GetCommand(params);

    return this.dynamoDBDocumentClient.send(command);
  }

  async queryItem(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>,
    filterExpression?: string,
  ): Promise<QueryCommandOutput> {
    logger.info({ keyConditionExpression, expressionAttributeNames, expressionAttributeValues }, `Querying items from DynamoDB table: ${ tableName }`);

    const params: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
      ReturnConsumedCapacity: 'TOTAL',
    };

    const command = new QueryCommand(params);

    return this.dynamoDBDocumentClient.send(command);
  }

  async putItem(tableName: string, item: Record<string, any>, options?: {
    conditionExpression?: string;
    [key: string]: any; // For future extensibility
  }): Promise<PutCommandOutput> {
    logger.info(item, `Putting item into DynamoDB table: ${ tableName }`);

    const params: PutCommandInput = {
      Item: item,
      TableName: tableName,
      ReturnConsumedCapacity: 'TOTAL',
      ...(options?.conditionExpression && { ConditionExpression: options.conditionExpression }),
      ...(options?.expressionAttributeNames && { ExpressionAttributeNames: options.expressionAttributeNames }),
    };

    const command = new PutCommand(params);

    return this.dynamoDBDocumentClient.send(command);
  }

  async updateItem(params: UpdateCommandInput): Promise<UpdateCommandOutput> {
    logger.info(params, 'Updating item in DynamoDB table');

    const command = new UpdateCommand(params);

    return this.dynamoDBDocumentClient.send(command);
  }

  async deleteItem(
    params: DeleteCommandInput,
  ): Promise<DeleteCommandOutput> {
    logger.info(params, 'Deleting item from DynamoDB table');
    const command = new DeleteCommand(params);

    return this.dynamoDBDocumentClient.send(command);
  }
}

export class ItemNotFoundError extends Error { }
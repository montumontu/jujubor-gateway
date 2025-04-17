import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentRepository } from "../shared/dynamodb.repository"
const TABLE_NAME = process.env.CLUSTER_TABLE_NAME || "ClusterTable";
import { randomUUID } from 'crypto';

export class ApiController {
    constructor() {

    }
    async createCluster(body: any) {
        const item = JSON.parse(body);
        item.clusterId = `${randomUUID()}`;
        const dynamoDb = DynamoDBDocumentRepository.getInstance();
        const createStatus = await dynamoDb.putItem(TABLE_NAME, item);
        return createStatus;
    }
}
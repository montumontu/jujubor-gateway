import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentRepository } from "../shared/dynamodb.repository"
const TABLE_NAME = process.env.CLUSTER_TABLE_NAME || "ClusterTable";

export class ApiController {
    constructor() {

    }
    async createCluster(body: any) {
        const item = JSON.parse(body);
        const dynamoDb = DynamoDBDocumentRepository.getInstance();
        const createStatus = await dynamoDb.putItem(TABLE_NAME, item);
        return createStatus;
    }
}
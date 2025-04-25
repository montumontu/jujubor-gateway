import { DynamoDBDocumentRepository } from "../shared/dynamodb.repository"
const TABLE_NAME = process.env.CLUSTER_TABLE_NAME || "JujuborGatewayInfraStack-ClusterTableEF396BCE-HXKIRE7E5HJ8";
import { randomUUID } from 'crypto';

export class ApiController {
    constructor() {

    }
    async createCluster(body: any) {
        const items = JSON.parse(body);
        for (const item of items) {
            item.clusterId = `${randomUUID()}`;
        }
        const dynamoDb = DynamoDBDocumentRepository.getInstance();
        let createStatus;
        // this needs to be corrected
        if (!items.length) {
            return new Error("Cluster not found");
        }
        if (items.length > 1) {
            createStatus = await dynamoDb.bulkPutItems(TABLE_NAME, items);
        } else {
            createStatus = await dynamoDb.putItem(TABLE_NAME, items[0]);
        }
        
        return createStatus;
    }
}

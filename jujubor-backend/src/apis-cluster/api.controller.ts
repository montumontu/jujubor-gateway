import { DynamoDBDocumentRepository } from "../shared/dynamodb.repository"
const TABLE_NAME = "JujuborGatewayInfraStack-ClusterTableEF396BCE-1A0QH82SFG0HX" || process.env.CLUSTER_TABLE_NAME || "JujuborGatewayInfraStack-ClusterTableEF396BCE-HXKIRE7E5HJ8";
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

    async getApi(orgId: string, clusterId: string): Promise<any> {
        const dynamoDb = DynamoDBDocumentRepository.getInstance();
        if (!orgId) {
            throw new Error("Org id not found");
        }
        if (clusterId && orgId) {
            const keyConditionExpression = `#clusterId = :clusterId AND #orgId = :orgId`;
            const expressionAttributeNames = { 
                '#clusterId': 'clusterId',
                '#orgId': 'orgId',
            };
            const expressionAttributeValues = {
                ":clusterId": clusterId,
                ":orgId": orgId,
            };
            console.log("Table name", TABLE_NAME);
            const clusterList = await dynamoDb.queryItem(TABLE_NAME, keyConditionExpression, expressionAttributeNames, expressionAttributeValues);
            if (!clusterList.Items?.[0]) {
                throw new Error("Cluster list not Found");
            }
            return clusterList;
        } else if (orgId) {
            console.log("Only org id query here");
            const keyConditionExpression = `#orgId = :orgId`;
            const expressionAttributeNames = { 
                '#orgId': 'orgId',
            };
            const expressionAttributeValues = {
                ":orgId": orgId,
            };
            const clusterList = await dynamoDb.queryItem(TABLE_NAME, keyConditionExpression, expressionAttributeNames, expressionAttributeValues);
            if (!clusterList.Items?.[0]) {
                throw new Error("Cluster list not Found");
            }
            return clusterList;
        } else {
            throw new Error("Valid parameters not found");
        }
    }

    async updateCluster(orgId: string, prefix: string, changedProperties: { [key: string]: any }) {
        try {
            const { updateExpression, expressionAttributeNames, expressionAttributeValues } = this.buildUpdateExpression(changedProperties);
            const dynamoDb = DynamoDBDocumentRepository.getInstance();
    
            const updateItem = await dynamoDb.updateItem({
                TableName: TABLE_NAME,
                Key: { orgId, prefix }, // assuming clusterId is the sort key
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "ALL_NEW",
            });
    
            return {
                statusCode: 200,
                body: JSON.stringify(updateItem),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error updating cluster", error }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }
    }
    buildUpdateExpression(changedProperties: { [key: string]: any }) {
        const expressionAttributeNames: { [key: string]: string } = {};
        const expressionAttributeValues: { [key: string]: any } = {};
        const updateExpressions: string[] = [];
    
        Object.entries(changedProperties).forEach(([key, value], index) => {
            const attrName = `#attr${index}`;
            const attrValue = `:val${index}`;
    
            expressionAttributeNames[attrName] = key;
            expressionAttributeValues[attrValue] = value;
            updateExpressions.push(`${attrName} = ${attrValue}`);
        });
    
        const updateExpression = `SET ${updateExpressions.join(', ')}`;
    
        return {
            updateExpression,
            expressionAttributeNames,
            expressionAttributeValues,
        };
    }
}

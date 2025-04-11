import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const clusterTable = new dynamodb.Table(this, 'ClusterTable', {
      partitionKey: { name: 'orgId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'clusterId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda function
    const backendLambda = new lambda.Function(this, 'StoreClusterInfoLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend-app'), // your lambda code folder
      environment: {
        CLUSTER_TABLE_NAME: clusterTable.tableName,
      },
    });

    // Give Lambda access to DynamoDB
    clusterTable.grantReadWriteData(backendLambda);
  }
}

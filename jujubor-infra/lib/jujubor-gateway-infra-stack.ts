import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import path = require('path');

export class JujuborGatewayInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // DynamoDB table
    const clusterTable = new dynamodb.Table(this, 'ClusterTable', {
      partitionKey: { name: 'orgId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'prefix', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.createLambdaFunction(this,
      "ClusterLambda",
      path.join(__dirname, "../../jujubor-backend/src/apis-cluster/api.index.ts"),
      {
        CLUSTER_TABLE_NAME: clusterTable.tableName,
      },
      clusterTable,
    );
  }

  createLambdaFunction(stack: cdk.Stack, id: string, entry: string, environment: {[key: string]: string}, table: dynamodb.ITable): lambda.Function {
    const lambdaFunction = new cdk.aws_lambda_nodejs.NodejsFunction(stack, id, {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry,
      handler: 'handler',
      environment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 1024,
      depsLockFilePath: path.join(__dirname,'../../jujubor-backend/package-lock.json'),
      bundling: {
        externalModules: [ '@aws-sdk/*', '@smithy/*'],
        nodeModules: [ '@aws-sdk/lib-dynamodb', '@aws-sdk/client-dynamodb'],
        minify: true,
        sourceMap: false,
      },
      functionName: id,
    })
    table.grantReadWriteData(lambdaFunction);
    const functionUrl = lambdaFunction.addFunctionUrl({ authType: lambda.FunctionUrlAuthType.NONE});
    new cdk.CfnOutput(stack, `${ id }-FunctionUrl`, {
      value: functionUrl.url,
      description: `URL for the lambda function ${id}`
    });
    return lambdaFunction;
  }
}

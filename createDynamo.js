const aws = require('aws-sdk');

const dynamodb = new aws.DynamoDB({
  endpoint: 'http://localhost:8000',
  region: 'local',
});

dynamodb
  .createTable({
    TableName: 'entities_dev',
    KeySchema: [
      { AttributeName: 'partitionId', KeyType: 'HASH' },
      { AttributeName: 'entityId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'partitionId', AttributeType: 'S' },
      { AttributeName: 'entityId', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 100,
      WriteCapacityUnits: 10,
    },
  })
  .promise()
  .then((result) => console.log(result));

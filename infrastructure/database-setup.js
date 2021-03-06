"use strict";

const Promise = require('bluebird');
const AWS = require("aws-sdk");
const nconf = require("nconf");


class DatabaseSetup {

    SetupNoSqlTables() {
        var config = nconf.get("DynamoDb");
        AWS.config.update({
            region: config.Region,
            endpoint: config.Endpoint
        });

        var dynamodb = Promise.promisifyAll(new AWS.DynamoDB());

        dynamodb.describeTableAsync({ TableName : "Ideas" })
                .then(function(data) {
                    console.info("Table exists. Table description in JSON: ", JSON.stringify(data, null, 2));
                }, function(err){
                    console.error("Table doesn't exist? Error JSON: ", JSON.stringify(err, null, 2));
                    var params = {
                        TableName : "Ideas",
                        KeySchema: [       
                            { AttributeName: "id", KeyType: "HASH"}   //Partition key
                        ],
                        AttributeDefinitions: [       
                            { AttributeName: "id", AttributeType: "S" },
                        ],
                        ProvisionedThroughput: {       
                            ReadCapacityUnits: 10, 
                            WriteCapacityUnits: 10
                        }
                    };

                    dynamodb.createTableAsync(params)
                            .then(function(data) {
                                console.info("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                            }, function(err) {
                                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                            });
                });
        }
    }

module.exports = new DatabaseSetup();


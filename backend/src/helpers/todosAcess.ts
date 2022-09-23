import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor (
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly tableName = process.env.TODOS_TABLE,
        private readonly indexName = process.env.TODOS_CREATED_AT_INDEX
    ){}

    async createTodo(todoItem: TodoItem): Promise<TodoItem>{
        await this.docClient.put({
            Item: todoItem,
            TableName: this.tableName
        }).promise()

        logger.info("Todos Created")

        return todoItem;
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]>{
        const todos = await this.docClient.query({
            IndexName: this.indexName,
            TableName: this.tableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                'userId': userId
            }
        }).promise()

        return todos.Items as TodoItem[]
    }

    async updateTodo(userId:string, todoId:string, updateItem:UpdateTodoRequest): Promise<TodoUpdate>{
        const todo = await this.docClient.update({
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            TableName: this.tableName,
            UpdateExpression: "set name=:name, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
                ":name": updateItem.name,
                ":dueDate": updateItem.dueDate,
                ":done": updateItem.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        logger.info("Item Updated.")

        return todo.Attributes as TodoUpdate
    }

    async deleteTodo(userId:string, todoId:string) {
        await this.docClient.delete({
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            TableName: this.tableName
        }).promise()
    }

    
}
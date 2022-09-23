import { TodosAccess } from '../helpers/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess();
const s3Bucket = process.env.ATTACHMENT_S3_BUCKET
const logger = createLogger("Todos Logic")
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId:string):Promise<TodoItem[]>{
    try{
        logger.info("Fetching todos for user...")
        const todos = await todosAccess.getTodosForUser(userId)
        return todos
    } catch(e){
        logger.error("Error: ", createError(e))
    }
}

export async function createTodo(userId:string, todoItem:CreateTodoRequest):Promise<TodoItem>{
    const todoId:uuid = uuid.v4()
    const attachmentUrl = `https://${s3Bucket}.s3.amazonaws.com/${userId}-${todoId}-dev`
    const newTodoItem:TodoItem = {
        userId: userId,
        todoId: todoId,
        name: todoItem.name,
        dueDate: todoItem.dueDate,
        done: false,
        createdAt: Date.now.toString(),
        attachmentUrl: attachmentUrl
    }

    try {
        logger.info("Creating Todo ....")
        const newTodo  = await todosAccess.createTodo(newTodoItem)
        return newTodo
    } catch(e){
        logger.error("Error: ", createError(e))
    }

}

export async function updateTodo(
    userId:string,
    todoId:string,
    updateItem:UpdateTodoRequest)
    :Promise<UpdateTodoRequest>{
        try {
            logger.info("Updating todo ...")
            const updatedTodo = await todosAccess.updateTodo(userId,todoId,updateItem)
            return updatedTodo
        } catch (e){
            logger.error("Error: ", createError(e))
        }
    }

export async function deleteTodo(userId:string, todoId:string){
    try {
        logger.info("Deleting todo ...")
        await todosAccess.deleteTodo(userId, todoId)
    } catch(e){
        logger.error("Error: ", createError(e))
    }
}

export async function createAttachmentPresignedUrl(userId:string, todoId:string):Promise<string>{
    try {
        logger.info("Genering Presigned URL ...")
        const url = await attachmentUtils.generateUploadUrl(userId, todoId)
        return url
    } catch(e){
        logger.error("Error: ", createError(e))
    } 
}
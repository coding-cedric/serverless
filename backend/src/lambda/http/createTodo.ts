import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    const item  = await createTodo(userId, newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true,
    headers: true,
    origin:'*'
  })
)

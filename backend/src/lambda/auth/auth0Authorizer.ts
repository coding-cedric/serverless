import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-kdtq23z5.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const { data } = await Axios.get<any>(jwksUrl, {headers: {Accept: 'application/json'}})
  const cert = data.keys[0].kid
  console.log(cert, jwt.header.kid)
  const certificate = `-----BEGIN CERTIFICATE-----
  MIIDDTCCAfWgAwIBAgIJX6aNU+9yuuxRMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
  BAMTGWRldi1rZHRxMjN6NS51cy5hdXRoMC5jb20wHhcNMjIwOTIyMjMyNDEyWhcN
  MzYwNTMxMjMyNDEyWjAkMSIwIAYDVQQDExlkZXYta2R0cTIzejUudXMuYXV0aDAu
  Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwAgHWqaab7DoLZhk
  46xgLD0jSlsHu1XCHyjUMoYl0CHxIMXoTBErH1B5pf5RAR/qI+lebsd1Ju781sXk
  /VG9m3R0GkIjVEATXiUwQJr2x9JTzsG2LoGqv27rCYQCHIjI1yxUwsZxxfoC1oeo
  ZckulUsvHy/KvdxoftdjF8yZFhBIaEsGIQi8suNMKkjbD+v6+HbybGN667zuiQV/
  o8A+beC1ez9t0dj2UG9qbPctwNTknDTmqAFYnnonyczBrIzqQPbiwCxVluApDRzA
  cwhmIlOdSHg7sJhCV2BCH1REzFJ8jCX0BxeQ07jjanW4BfJcHW/LwkZeXD+FJiiE
  9p74ZwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSopUijVigT
  gMPpfM0p4CVmZTwwhzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
  ALADe0jqKhg5ZlX6utB0Kwj4odclv/r/J6p3BTVry2NAj7SwQ25ldnMOEPtqSQ17
  8VTyUa8zNjcWnIMBKUdZgFjcT8a3E0e/YiRMN3HGjvmVXQ4+Tes96JDwG3MuRcw0
  FuDAcKzD14YEcRhgZo5Jz56OzTro1g8VXFrF4pMaa8EjavkNV+PDOn9v5k6ftUDR
  9EX8vexIycAuepK4DPjVrr9npfQlLMwLoW/J3KSWSnHP7eRIJrG/YxBZy21hmc1o
  qCUQBJU5sarApnmX9NbJleLa8z25DfvqrTh/EjXPN864g/Mgd2UiqU9sbXZcvID0
  I3+Y7A8EoZf9cdHeGcPsq14=
  -----END CERTIFICATE-----`
  
  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

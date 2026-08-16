import { handle } from 'hono/aws-lambda';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

const prefix = process.env.SSM_PREFIX;

let honoHandler: ReturnType<typeof handle> | undefined;

export const handler = async (event: any, context: any) => {
  if (!honoHandler) {
    const ssm = new SSMClient();

    const response = await ssm.send(
      new GetParametersCommand({
        Names: [`/${prefix}/auth0_client_id`, `/${prefix}/auth0_client_secret`, `/${prefix}/frontend_origin`],
        WithDecryption: true,
      })
    );

    for (const param of response.Parameters ?? []) {
      if (param.Name === `/${prefix}/auth0_client_id`) {
        process.env.AUTH0_CLIENT_ID = param.Value;
      }
      if (param.Name === `/${prefix}/auth0_client_secret`) {
        process.env.AUTH0_CLIENT_SECRET = param.Value;
      }
      if (param.Name === `/${prefix}/frontend_origin`) {
        process.env.FRONTEND_ORIGIN = param.Value;
      }
    }

    const { default: app } = await import('./index');

    honoHandler = handle(app);
  }

  return honoHandler(event, context);
};

import awsConfig from "./aws-config.json";
import {Amplify, HubPayload, Hub} from "@aws-amplify/core";
import {Auth} from "@aws-amplify/auth";
import {API} from "@aws-amplify/api";
import {PubSub} from "@aws-amplify/pubsub";
const {region, userPoolClientId, userPoolId, identityPoolRef, graphqlUrl} = awsConfig;

const configureAmplify = () => {
    // https://docs.amplify.aws/lib/client-configuration/configuring-amplify-categories/q/platform/js
// Scoped configuration is bullshit, there are no examples and the syntax is some snake_case camelcase
// https://github.com/dabit3/appsync-auth-and-unauth

    //Amplify.Logger.LOG_LEVEL = "DEBUG";

    Amplify.register(Auth)
    Amplify.register(API)
    Amplify.register(PubSub)

    const config = {
        // AUTH
        aws_cognito_region: region, // (required) - Region where Amazon Cognito project was created
        aws_user_pools_id:  userPoolId, // (optional) -  Amazon Cognito User Pool ID
        aws_user_pools_web_client_id: userPoolClientId, // (optional) - Amazon Cognito App Client ID (App client secret needs to be disabled)
        aws_cognito_identity_pool_id: identityPoolRef, // (optional) - Amazon Cognito Identity Pool ID
        aws_mandatory_sign_in: "disabled", // (optional) - Users are not allowed to get the aws credentials unless they are signed in

        // API
        aws_appsync_region: region, // (optional) - AWS AppSync region
        aws_appsync_graphqlEndpoint: graphqlUrl, // (optional) - AWS AppSync endpoint
        // Seems to be more a kind of default auth type, you can override it per query, see create tenant
        aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS", // (optional) - Primary AWS AppSync authentication type

        // Usually we send only the access key which does not contain the username and other things encoded in the JWT
        // So we send our "own" header with the id token
        API: {
            graphql_headers: async () => {
                try {
                    const session = await Auth.currentSession();
                    if(session) {
                        return {
                            Authorization: session.getIdToken().getJwtToken(),
                        };
                    }
                } catch(e) {
                    console.warn(e)
                }
            },
        }
    }

    Amplify.configure(config);
}

/**
 * This class connects our redux store and the amplify library
 *
 * https://richardzcode.github.io/Journal-AWS-Amplify-Tutorial/step-05/
 */
export class AmplifyBridge {

    constructor() {
        configureAmplify();

        Hub.listen('auth', (data) => {
            const { payload } = data;
            this.onAuthEvent(payload);
        })
    }

    onAuthEvent(payload: HubPayload) {
        const {event} = payload
        if(event === 'signIn') {
            console.log('signin')
        }
    }
}
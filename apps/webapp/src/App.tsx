import React, {useEffect, useState} from 'react';
import {AmplifyBridge} from "./AmplifyBridge";
import {Auth} from "@aws-amplify/auth";
import {API, graphqlOperation} from "@aws-amplify/api";
import type {Observable} from "zen-observable-ts";

new AmplifyBridge()

function DataReceiver() {

    const [data, setData] = useState(null)

    useEffect(() => {
        const subscription = (API.graphql(
                graphqlOperation(`
            subscription deviceStatusSubscription($tenant_id: ID!) {
              deviceStatusSet(tenant_id: $tenant_id) {
                id
                status
                configuration
                tenant_id
              }
            }
        `, {
                    tenant_id: 'cl0miesmm000009mazi00p2qu'
                })
            ) as Observable<object>).subscribe({
                next: (data: any) => {
                    setData(data)
                }
            })

        return () => {
            subscription?.unsubscribe()
        }
    })

    return (
        <div>
            <h2>Data</h2>
            { data && <div>{ JSON.stringify(data) } </div> }
        </div>
    )
}

function App() {

    const [user, setUser] = useState(null)

    console.log('rerender')
    const loginUser = ({email, password} : {
        email: string,
        password: string
    }) => {
        Auth.signIn(email, password).then((user) => {
            setUser(user)
        }).catch((error) => {
            console.error(error)
        })
    }

    const logoutUser = () => {
        Auth.signOut().finally(() => {
            setUser(null)
        })
    }

    useEffect( () => {
        Auth.currentAuthenticatedUser().then((user) => {
            setUser(user);
        }).catch((error) => {
            console.log('No user logged in', error)
        })
    }, [])

  return (
    <div className="">
      <header className="App-header">
        <h1>Amplify Modular Packages Issue Reproduction</h1>
        <div>
            { user ? <DataReceiver/> : <div>
                <form target='#' onSubmit={(event) => {
                        event.preventDefault();

                        const data = new FormData(event.currentTarget)
                        const email = data.get('email')?.toString()
                        const password = data.get('password')?.toString()
                        if(email && password) {
                            loginUser({
                                email,
                                password
                            })
                        }
                    }
                }>
                    <div>
                        <label>
                            Email:
                            <input autoComplete='email' type="text" name="email" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Password:
                            <input autoComplete='current-password' type="password" name="password" />
                        </label>
                    </div>
                    <div>
                        <input type="submit" value="Submit" />
                    </div>
                </form>
                </div>
            }

            {
                user && <button onClick={logoutUser}>Logout</button>
            }

        </div>
      </header>
    </div>
  );
}

export default App;

import { TopBar } from "../Components/TopBar";
import { Link, useNavigate } from "react-router-dom";
import { useApolloClient, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Container, Paper, TextField, Typography, Avatar, Button, CardContent, Grid } from '@mui/material';
import { useEffect, useState } from "react";
import { PROFILE, AUTHORIZATION, JWT_ACCESS_TOKEN_KEY } from "../Shared/Constants";
import { EXPLORE_FOR_USERS, FOLLOW_A_USER } from "../GraphQLQuery/queries";
import { LoadingPage } from "../Helpers/Utility";

export function ExplorePage(props) {
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const [searchString, setSearchString] = useState('')
    const [disableButtons, setDisableButtons] = useState(false);
    
    const [results, setResults] = useState([]);
    const [exploreForUsersQL, {data, loading, error, refetch: refetchExploreUsers}] = useLazyQuery(EXPLORE_FOR_USERS, {
        variables: {
            celebrityUsername: searchString
        },
        context: {
            headers: {
                [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
            }
        },
        fetchPolicy: 'no-cache'
    })
    const [followAUserQL, {loading: followAUserLoading, error: followAUserError}] = useMutation(FOLLOW_A_USER);
    useEffect(() => {
        if(results.length === 0)
            return;
        console.log(results);
    }, [results])

    if(loading)
        return (<LoadingPage />)

    return (
        <Container style={{ marginTop: '20px', marginBottom: '20px' }}>
            <TopBar navigate={navigate} apolloClient={apolloClient} />
            <Paper style={{ padding: '10px 20px'}}>
                <Paper elevation={0} style={{ display: 'flex',marginBottom: '20px', marginTop: '80px' }}>
                    <TextField
                        label="Explore Users"
                        variant="outlined"
                        fullWidth
                        style={{ marginRight: '10px' }}
                        value={searchString}
                        onChange={e => {e.preventDefault(); setSearchString(e.target.value)}}
                    />
                    <Button disabled={disableButtons} variant="contained" color="primary" onClick={async e=>{
                        e.preventDefault();
                        setDisableButtons(true);
                        try {
                            const response = await exploreForUsersQL({
                                variables: {
                                    celebrityUsername: searchString
                                }
                            })
                            setResults(response.data.exploreForUsers);
                        } catch (error) {
                            console.log(error);
                        }finally{
                            setDisableButtons(false);
                        }
                    }}>
                        Search
                    </Button>
                </Paper>
                {loading ? <LoadingPage /> : (error ? null : DisplayResults(results, disableButtons, setDisableButtons, followAUserQL, exploreForUsersQL, searchString, setResults))}
            </Paper>
        </Container>
    )
}

function DisplayResults(users, disableButtons, setDisableButtons, followAUserQL, exploreForUsersQL, searchString, setResults) {
    if(!users.length && users.length === 0){
        return (
            <Typography variant="h3" color="textSecondary">
                No Results Found
            </Typography>
        )
    }
    async function followRequestHandler(e, username) {
        e.preventDefault();
        setDisableButtons(true)
        try {
            const response = await followAUserQL({
                variables: {
                    celebrityUsername: username
                },
                context: {
                    headers: {
                        [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                    }
                }
            });
            console.log(response);
            const exploredUsers = await exploreForUsersQL({
                variables: {
                    celebrityUsername: searchString
                },
                context: {
                    headers: {
                        [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                    }
                }
            });
            setResults(exploredUsers.data.exploreForUsers);
        } catch (error) {
            console.log(error);
        } finally {
            setDisableButtons(false);
        }
    }
    return (
        <Paper style={{padding: '20px 0'}} elevation={0}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {users.map((user, index) => (
                <Paper elevation={3} key={index} style={{ flex: '1 1 calc(33.33% - 10px)', padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Link to={`/${PROFILE}/${user.username}`}><Avatar alt={user.username} style={{ width: '80px', height: '80px', marginBottom: '10px' }}>{user.username[0]}</Avatar></Link>
                        <Typography variant="subtitle1" style={{ marginBottom: '0' }}>{user.name}</Typography>
                        <Paper elevation={0} style={{display: 'flex', flexDirection: 'row', gap: '5px', marginBottom: '5px'}}>
                            <Typography variant="caption">4.5M Followers</Typography>
                            <Link to={`/${PROFILE}/${user.username}`}><Typography variant="body2" color="textSecondary" style={{ textAlign: 'center' }}>@{user.username}</Typography></Link>
                        </Paper>
                        {
                            user.isFollowingThisProfile ? (<Button variant='contained' color='success'>Following</Button>) : (<Button disabled={disableButtons} variant='contained' color='primary' onClick={e => followRequestHandler(e, user.username)}>Follow +</Button>)
                        }
                    </div>
                </Paper>
            ))}
            </div>
        </Paper>
    )
}
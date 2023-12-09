import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { Typography, Container, Paper } from '@mui/material';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import { FEED_FOR_USER, HELLO_AUTH } from '../GraphQLQuery/queries';
import { LoadingPage, Tweet, logoutHandler, redirectHandler } from '../Helpers/Utility';
import { JWT_ACCESS_TOKEN_KEY, AUTHORIZATION } from '../Shared/Constants';
import { TopBar } from '../Components/TopBar';

export function HomePage(props) {
    const token = sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY);
    const [name, setName] = useState(jwtDecode(token).username);
    const [jwtToken, setJwtToken] = useState('');
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const [feed, setFeed] = useState([])
    
    const [getUserFeedQL, {data, loading, error}] = useLazyQuery(FEED_FOR_USER, {
        context: {
            headers: {
                [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
            }
        }
    })
    useEffect(() => {
        (async () => {
            try {
                console.log('getting user Feed');
                const res = await getUserFeedQL();
                console.log(res.data.feedForUser);
                setFeed(res.data.feedForUser)
            } catch (error) {
                console.log(error)
            }
            
        })()
    }, [])
    if(loading)
        return (<LoadingPage />)
    return (
        <Container>
            <TopBar navigate={navigate} apolloClient={apolloClient} />
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', marginTop: '80px', position: 'relative' }}>
                <Paper elevation={0}>
                    Welcome, {name}
                </Paper>
                <Paper elevation={0} style={{margin: '20px 0'}}>
                    {FeedRenderer(feed)}
                </Paper>
            </Paper>
        </Container>
    )
};

function FeedRenderer(feeds) {
    if(!feeds.length && feeds.length === 0){
        return (
            <Typography variant="body1" color="textSecondary">
                No tweets yet, Follow someone first
            </Typography>
        )
    }
    return(
        <>{feeds.map((feed, index) => (<Tweet likeCount={feed.likeCount} key={index} author={feed.username} timestamp={feed.postedDate} content={feed.content} />))}</>
    )
}
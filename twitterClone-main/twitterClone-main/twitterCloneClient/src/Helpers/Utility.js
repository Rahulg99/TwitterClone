import { Link } from 'react-router-dom';
import { JWT_ACCESS_TOKEN_KEY } from '../Shared/Constants';
import { 
    Container, 
    CircularProgress,
    Paper, 
    Avatar, 
    Typography, 
    Button, 
    AppBar,Modal,TextField,
    Toolbar, 
    IconButton
} from '@mui/material';
export function redirectHandler(path, navigate) {
    navigate(path);
}

export function logoutHandler (e, navigate, apolloClient) {
    apolloClient.resetStore().then(data => {
        console.log('reset store success')
    }).then(err => console.log(err))
    sessionStorage.removeItem(JWT_ACCESS_TOKEN_KEY);
    navigate('/');
}

export function LoadingPage() {
    return(
        <Container
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <>
                <CircularProgress size={80} />
                <Typography variant="h6">Loading...</Typography>
            </>
        </Container>
    )
}

export function Tweet (props) {
    const dateTime = new Date(parseInt(props.timestamp, 10));
    const DateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }
    return (
        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Avatar alt={`${props.author} Profile Picture`} src="profile-picture-url" style={{ width: 40, height: 40, marginRight: '10px' }} />
                <Link to={`/profile/${props.author}`}><Typography variant="subtitle1">@{props.author}</Typography></Link>
                <Typography variant="caption" style={{ marginLeft: '10px' }}>{dateTime.toLocaleString('en-US', DateOptions)}</Typography>
            </div>
            <Typography variant="body1">{props.content}</Typography>
            <div style={{padding: '10px 0px', display: 'flex', justifyContent: 'left', gap: '20px', flexDirection: 'row'}}>
                <Button variant="outlined" color="primary">{props.likeCount} Likes</Button>
                <Button variant="outlined" color="primary">Share</Button>
                {props.children}
            </div>
        </Paper>
    );
};

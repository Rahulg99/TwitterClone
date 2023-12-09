import { 
    Container, 
    Paper, 
    Avatar, 
    Typography, 
    Button, 
    AppBar, 
    Toolbar, 
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EXPLORE, HOME, PROFILE } from '../Shared/Constants';
import { Twitter } from '@mui/icons-material';
import { logoutHandler } from '../Helpers/Utility';

export function TopBar (props) {
    
    function NavBarButton (props) {
        return(
            <Button variant="outlined" style={{ color: '#ffffff' }}
                onClick={e=>props.navigate(props.path)}
            >{props.text}</Button>
        )
    }
    return(
        <AppBar position="fixed">
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                <IconButton onClick={e => {props.navigate(-1)}} edge="start" color="inherit" aria-label="menu">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" style={{paddingLeft:'10px'}}>{'Twitter'}<Twitter fontSize='large'/></Typography>
                <Container style={{ display: 'flex', gap: '20px'}}>
                    <NavBarButton text={'Home'} path={`/${HOME}`} navigate={props.navigate} />
                    <NavBarButton text={'Profile'} path={`/${PROFILE}`} navigate={props.navigate} />
                    <NavBarButton text={'Explore'} path={`/${EXPLORE}`} navigate={props.navigate} />
                    <Button style={{color: 'white', fontWeight: 'bolder', marginLeft: 'auto'}} variant='outlined' onClick={e => {e.preventDefault();logoutHandler(e, props.navigate, props.apolloClient)}}>{'Log Out'}</Button>
                </Container>
            </Toolbar>
        </AppBar>
    )
};

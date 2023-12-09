import { useState } from 'react';
import { Input, InputLabel, Typography } from '@mui/material';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { JWT_ACCESS_TOKEN_KEY, URL_LOGIN } from '../Shared/Constants';
import { FormContainer, FormField, SubmitButton, WarningLabel } from '../Shared/SharedStyles';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_USER } from '../GraphQLQuery/queries';

export function LoginPage(props) {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ warningMessage, setWarningMessage ] = useState('');
    const [ disabled, setDisabled ] = useState(false);
    const navigate = useNavigate();
    const [loginUserQL] = useMutation(LOGIN_USER);
    
    return (
        <FormContainer onSubmit={e => e.preventDefault()} >
            <Typography variant="h5">Login To Twitter react</Typography>
            {warningWatcher(warningMessage)}    
            <FormField>
                <InputLabel>Email address</InputLabel>
                <Input name='username' value={username} type='text' onChange={e => changeHandler(e.target, setUsername)} onFocus={e => focusHandler(setWarningMessage)} />
            </FormField>
            <FormField>
                <InputLabel>Password</InputLabel>
                <Input name='password' value={password} type='password' onChange={e => changeHandler(e.target, setPassword)} onFocus={e => focusHandler(setWarningMessage)} />
            </FormField>
            <SubmitButton onClick={async e => {
                    try {
                        setDisabled(true)
                        await loginHandler(username, password, setWarningMessage, navigate, loginUserQL)
                    } catch (error) {
                        console.log(error)
                    }finally{
                        setDisabled(false);
                    }
                }
            } 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={disabled}
            sx={{ marginTop: 2 }}
            >
                Login
            </SubmitButton>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
                Don't have an account?{' '}
                <Link to="/register">Register here</Link>
            </Typography>
        </FormContainer>
    )
}
const warningWatcher = (warningMessage) => {
    if(warningMessage.trim().length === 0)
        return null;
    else {
        return(
            <WarningLabel severity="warning" sx={{ marginBottom: 2 }}>
                {warningMessage}
            </WarningLabel>
        )
    }
}

const changeHandler = (target, setState) => {
    setState(target.value);
}

const focusHandler = setWarningMessage => {
    setWarningMessage('');
}

const validator = (username, password, setWarningMessage) => {
    if(username.trim().length === 0) {
        setWarningMessage('Username is empty')
        return false;
    }
    if(password.trim().length === 0){
        setWarningMessage('Password can not be empty')
        return false;
    }
    return true;
}

const loginHandler = async (username, password, setWarningMessage, navigate, loginUserQL) => {
    if(!validator(username, password, setWarningMessage))
        return;
    const payload = {username: username, password: password}
    console.log('sending request')
    
    try {
        const responseQL = await loginUserQL({
            variables:{
                input :payload
            }
        })
        if(responseQL.data){
            const JWT_TOKEN = responseQL.data.loginUser;
            console.log(JWT_TOKEN)
            sessionStorage.setItem(JWT_ACCESS_TOKEN_KEY, JWT_TOKEN);
            navigate('/home');
        }
    } catch (error) {
        console.log(error);
        setWarningMessage(error.message)
    }
}
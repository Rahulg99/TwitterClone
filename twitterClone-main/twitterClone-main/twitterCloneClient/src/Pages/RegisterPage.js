import { useState } from 'react';
import { Input, InputLabel, Typography } from '@mui/material';
import axios from 'axios';
import { URL_REGISTER, JWT_ACCESS_TOKEN_KEY } from '../Shared/Constants';
import {Link, useNavigate} from 'react-router-dom';
import { REGISTER_USER } from '../GraphQLQuery/queries';
import { FormContainer, FormField, SubmitButton, WarningLabel } from '../Shared/SharedStyles';
import { useMutation } from '@apollo/client';

export function RegisterPage(props) {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ warningMessage, setWarningMessage ] = useState('');
    const navigate = useNavigate();
    const [ disabled, setDisabled ] = useState(false);
    const [registerUserQL] = useMutation(REGISTER_USER);

    return (
        <FormContainer onSubmit={e => e.preventDefault()} >
            <Typography variant="h5">Register with us</Typography>
            {warningWatcher(warningMessage)}
            <FormField>
                <InputLabel>Email address</InputLabel>
                <Input name='username' value={username} type='text' onChange={e => changeHandler(e.target, setUsername)} onFocus={e => focusHandler(setWarningMessage)} />
            </FormField>
            <FormField>
                <InputLabel>Password</InputLabel>
                <Input name='password' value={password} type='password' onChange={e => changeHandler(e.target, setPassword)} onFocus={e => focusHandler(setWarningMessage)} />
            </FormField>
            <FormField>
                <InputLabel>Confirm Password</InputLabel>
                <Input name='confirm-password' value={confirmPassword} type='password' onChange={e => changeHandler(e.target, setConfirmPassword)} onFocus={e => focusHandler(setWarningMessage)} />
            </FormField>
            <SubmitButton onClick={async e => {
                    try {
                        setDisabled(true)
                        await registerHandler(username, password, confirmPassword, setWarningMessage, navigate, registerUserQL)
                    } catch (error) {
                        console.log(error)
                    }finally{
                        setDisabled(false);
                    }
                }} 
                type='button' 
                variant="contained" 
                color="primary" 
                sx={{ marginTop: 2 }}
            >
                Register
            </SubmitButton>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
                ALready have an account?{' '}
                <Link to="/login">Login here</Link>
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

const focusHandler = setWarningMessage => {
    setWarningMessage('');
}

const changeHandler = (target, setState) => {
    setState(target.value);
}

const validator = (username, password, confirmPassword, setWarningMessage) => {
    if(username.trim().length === 0) {
        setWarningMessage('Username is empty')
        return false;
    }
    if(password.trim().length === 0){
        setWarningMessage('Password can not be empty')
        return false;
    }
    if(confirmPassword !== password){
        setWarningMessage('Password and confirm password are different');
        return false;
    }
    return true;
}

const registerHandler = async (username, password, confirmPassword, setWarningMessage, navigate, registerUserQL) => {
    if(!validator(username, password, confirmPassword, setWarningMessage)){
        return;
    }
    const payload = {username: username, password: password}
    console.log('sending request')

    try {
        
        const responseQL = await registerUserQL({
            variables:{
                input :payload
            }
        })
        if(responseQL.data){
            console.log(responseQL.data);
            const JWT_TOKEN = responseQL.data.registerUser;
            sessionStorage.setItem(JWT_ACCESS_TOKEN_KEY, JWT_TOKEN);
            navigate('/home');
        }
    } catch (error) {
        console.log(error);
        setWarningMessage(error.message)
    }
}
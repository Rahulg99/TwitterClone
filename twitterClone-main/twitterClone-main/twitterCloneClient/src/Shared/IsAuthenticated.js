import { useLazyQuery, useQuery } from "@apollo/client";
import { JWT_ACCESS_TOKEN_KEY } from "./Constants";
import React, { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { HELLO_AUTH } from "../GraphQLQuery/queries";
import { LoadingPage } from "../Helpers/Utility";

export function IsAuthenticated ({children}) {
    const token = sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY);
	const navigate = useNavigate();

    const [authenticate, {data: dataAuthentication, error: errorAuthentication}] = useLazyQuery(HELLO_AUTH, {
        context: {
            headers: {
                authorization: token
            }
        }
    })
    useEffect(() => {
        authenticate();
    }, []);
    useEffect(() => {
        if(errorAuthentication){
            navigate('/');
            return;
        }
    }, [dataAuthentication, errorAuthentication]);
    if(dataAuthentication){
        return (<>{children}</>);
    } else {
        return (<LoadingPage></LoadingPage>)
    }
}


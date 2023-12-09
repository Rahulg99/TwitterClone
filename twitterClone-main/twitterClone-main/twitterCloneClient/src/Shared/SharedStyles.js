import { FormControl, styled, Button, Alert } from '@mui/material';

export const FormContainer = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '300px',
    margin: '0 auto',
    marginTop: (theme) => theme.spacing(3),
});
export const FormField = styled(FormControl)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));
export const SubmitButton = styled(Button)({
    marginTop: (theme) => theme.spacing(2),
});
export const WarningLabel = styled(Alert)({
    marginTop: '6px',   // Adjust as needed
    marginBottom: '0px',   // Adjust as needed
    padding: '2px 14px',
    fontSize: '0.8rem', // Adjust the font size as needed
});


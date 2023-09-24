import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignIn() {
  const [signinMessage, setSigninMessage] = React.useState('');

  React.useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('email')) {
      axios.post(`${process.env.REACT_APP_API_URL}/verify`, {token: localStorage.getItem('token'), email: localStorage.getItem('email')}, {
        withCredentials: true,
        }).then((response) => {
          if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            window.location.href = '/questions';
          }
        }).catch((error) => {
          console.log(error);
          localStorage.removeItem('token');
          localStorage.removeItem('email');
        }
      );
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const signInObject = {
      email: data.get('email'),
      password: data.get('password'),
    };
    axios.post(`${process.env.REACT_APP_API_URL}/signin`, signInObject, {
      withCredentials: true,
    }).then((response) => {
      setSigninMessage(response.data.message);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', data.get('email') as string);
      window.location.href = '/questions';
    }).catch((error) => {
      setSigninMessage(error.response.data.message);
    });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {signinMessage ? <Alert severity={signinMessage.includes("success") ? "success" : "error"} action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setSigninMessage('');
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }>{signinMessage}</Alert>: null}
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
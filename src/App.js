import { CssBaseline, ThemeProvider, alpha, createTheme } from '@mui/material';
import { MuiThemeProvider } from '@material-ui/core/styles';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from "react-router-dom";

import SignIn from './Components/SignIn';
import SignUp from './Components/SignUp';
import Dashboard from './Components/Dashboard';
import Groups from './Components/Groups';
import Navbar from './Components/Navbar';

const App = () => {
  const theme = createTheme({
    palette: {
      background: {
        default: alpha('#F8F8E8', 0.25),
        paper: alpha('#ebe7dd', 0.5),
      },
      primary: {
        main: "#46AD8D",
        contrastText: "#fff" //button text white instead of black
      },
    },
    overrides: {
      Card: {
        root: {
          backgroundColor: '#F8F8E8',
          margin: '5%'
        },
      },
    }
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/questions" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
// Uda3qZHxAfkMx0zH
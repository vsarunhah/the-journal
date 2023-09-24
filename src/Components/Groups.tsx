import { Box, Button, Input, Modal } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupPasscode, setNewGroupPasscode] = useState("");
    const [createGroupModal, setCreateGroupModal] = useState(false);
    const [createOrJoin, setCreateOrJoin] = useState("create" as "create" | "join");
    const [apiMessage, setApiMessage] = useState("");
    const [open, setOpen] = React.useState(false);

    function getGroups() {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        axios.post(`${process.env.REACT_APP_API_URL}/getGroups`, { token: token, email: email }).then((response) => {
            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                setGroups(response.data.groups); 
            }
        }).catch((error) => {
            console.log(error);
            setApiMessage(error.response.data.message);
            setOpen(true);
            if (error.response.data.message.includes("token")) {
                localStorage.removeItem("token");
                localStorage.removeItem("email");
                window.location.href = "/";
            } else {
                localStorage.setItem("token", error.response.data.token);
            }
        });
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        if (!(token && email)) {
            window.location.href = "/";
        }
        getGroups();
    }, []);

    const handleErrorClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
      };
    

    function createGroup() {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        let url = process.env.REACT_APP_API_URL;
        url = createOrJoin === 'create' ? url + '/createGroup' : url + '/joinGroup';
        axios.post(url, { token: token, email: email, groupName: newGroupName, groupPassword: newGroupPasscode }).then((response) => {
            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                getGroups();
                setCreateGroupModal(false);
            }
        }).catch((error) => {
            setApiMessage(error.response.data.message);
            setOpen(true);
            if (!error.response.data.message.includes("token")) {
                localStorage.setItem("token", error.response.data.token);
            }
        });
    }

    function handleClose() {
        setCreateGroupModal(false);
    }

    function handleOpen(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (e.currentTarget.id === 'create') {
            setCreateOrJoin('create');
        } else {
            setCreateOrJoin('join');
        }
        setCreateGroupModal(true);
    }

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };

    return (
        <div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert onClose={handleClose} severity={apiMessage.includes('') ? 'error' : 'error'} sx={{ width: '100%' }}>
                {apiMessage}
                </Alert>
            </Snackbar>
            {
                groups.map((group: any) => {
                    return (
                        <div key={group.name}>
                            <h1>{group.name}</h1>
                        </div>
                    )
                })
            }
            <Button variant="contained" onClick={handleOpen} id='create'>Create a new group</Button>
            <Button variant="contained" onClick={handleOpen} id='join'>Join a group</Button>
            <Modal
               open={createGroupModal}
               onClose={handleClose}
            >
                <Box sx={style}>
                    <Input placeholder="Enter a name" value={newGroupName} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewGroupName(e.target.value)} fullWidth/>
                    <Input placeholder="Enter a passcode for the group" value={newGroupPasscode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewGroupPasscode(e.target.value)} fullWidth/>
                    <Button variant="contained" onClick={createGroup}>{createOrJoin === 'create' ? 'Create a new group' : 'Join a group'}</Button> 
                </Box>
            </Modal>
        </div>
    )
}
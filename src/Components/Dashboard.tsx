import { Card, CardContent, TextField, Typography } from "@mui/material";
import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  // use the token to send a request to the server to get the user's data
  // display the user's data
  // show the user the groups they are part of and ask if they want to join another one or create a new one
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    questions: [],
    answers: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!(token && email)) {
      window.location.href = "/";
    }
    axios
      .post(`${process.env.REACT_APP_API_URL}/user`, { token: token, email: email })
      .then((response) => {
        if (response.status === 200) {
          setUserData(response.data);
          localStorage.setItem("token", response.data.token);
        }
      })
      .catch((error) => {
        console.log(error);
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.location.href = "/";
      });
  }, []);
  // list out the current groups the user is in and ask for a passcode to create a new one

  function questionAnswer() {
    const questions = userData["questions"];
    return questions.map((question, idx) => (
        <div key={idx}>
            <Card variant="outlined" key={question['nickname']}>
                <CardContent>
                    <Typography variant="h5" component="div" fontWeight={'bold'}>
                        {question["nickname"]}
                    </Typography>
                    <Typography variant="body2">
                        {question["question"]}
                    </Typography>
                    <br />
                    <TextField
                        id={`${idx}AnswerBox`}
                        label="Answer"
                        multiline
                        placeholder="Write as much or as little as you want!"
                        rows={5}
                        variant="filled"
                        sx={{ width: "100%" }}
                        defaultValue={userData['answers'].length > 0 ? userData['answers'][idx] : ''}
                        onBlur={(e) => {
                            const answer = e.target.value;
                            const token = localStorage.getItem("token");
                            const email = localStorage.getItem("email");
                            if (!(token && email)) {
                                window.location.href = "/";
                            }
                            axios
                                .post(`${process.env.REACT_APP_API_URL}/answer`, {
                                    token: token,
                                    email: email,
                                    question: idx,
                                    answer: answer,
                                }).then((response) => {
                                    if (response.status === 200) {
                                        localStorage.setItem("token", response.data.token);
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                    localStorage.setItem("token", error.response.data.token);
                                });
                        }}
                    />
                    {/* <br />
                    <br />
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<ImageIcon />}
                        sx={{ marginRight: "1rem" }}
                        id={`${idx}PictureUpload`}
                    >
                        Upload a picture!
                        <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                    </Button> */}
                </CardContent>
            </Card>
            <br />
        </div>
    ));
  }
  return <>
  {questionAnswer()}
  </>;
}

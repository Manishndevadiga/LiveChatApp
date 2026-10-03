import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import callApi from "../common/scripts.js";

function Signup({ user }) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (user) {
        return <Navigate to="/chat" replace />;
    }

    const handleSignup = async (event) => {
        event.preventDefault();

        const data = await callApi("/user/userSignup", "POST", {
            name,
            email,
            password,
        });

        console.log("Signup response:", data);

        if (data?.success) {
            toast.success("Account created successfully!", {
                duration: 3000,
                position: "top-center",
            });

            navigate("/chat");
        } else {
            toast.error(data.message, {
                duration: 3000,
                position: "top-center",
            });
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: "100%",
                        maxWidth: 420,
                        padding: 4,
                        borderRadius: 3,
                    }}
                >
                    <Typography
                        variant="h4"
                        textAlign="center"
                        fontWeight={600}
                        mb={3}
                    >
                        Create Account
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSignup}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Name"
                            fullWidth
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />

                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                        >
                            Sign Up
                        </Button>
                    </Box>

                    <Typography
                        textAlign="center"
                        mt={5}
                        variant="body2"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: 2,
                        }}
                    >
                        Already have an account?{" "}
                        <Link to="/">Login</Link>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

export default Signup;
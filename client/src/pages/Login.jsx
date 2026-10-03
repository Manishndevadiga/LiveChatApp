import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import callApi from "../common/scripts.js";

function Login({ user, setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    // If already logged in, don't show login page
    if (user) {
        return <Navigate to="/chat" replace />;
    }

    const handleLogin = async (event) => {
        event.preventDefault();

        const data = await callApi("/user/login", "POST", {
            email,
            password,
        });

        console.log("Login response:", data);

        if (data?.success) {
            setUser(data.user);

            toast.success("Login successful!", {
                duration: 3000,
                position: "top-center",
            });

            navigate("/chat");
        } else {
            toast.error(data?.message || "Login failed", {
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
                        Login
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleLogin}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
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
                            Login
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
                        Don't have an account?{" "}
                        <Link to="/signup">Sign up</Link>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

export default Login;
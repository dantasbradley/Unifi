import React from "react";
import { fireEvent, render, userEvent, waitFor } from "@testing-library/react-native";
import { renderRouter, screen } from 'expo-router/testing-library';
import AuthScreen from "../screens/AuthScreen";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import VerifyEmail from "../screens/resetEmail";
import Verification from "../screens/resetPassword";
import HomeScreen from "../tabs/HomeScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock("@react-native-async-storage/async-storage", () => {
    require('@react-native-async-storage/async-storage/jest/async-storage-mock');
})

describe("Front End Tests", () => {

    let fetchMock = jest.spyOn(global, "fetch").mockImplementation(jest.fn());

    // Auth Page Tests
    describe("Auth Screen Tests", () => {

        it("Buttons and text render correctly", () => {
            render(<AuthScreen/>);

            expect(screen.getByText("Login")).toBeOnTheScreen();
            expect(screen.getByText("Sign Up")).toBeOnTheScreen();
            expect(screen.getByText("UniFi")).toBeOnTheScreen();
        });

        it("Navigate to Login page", () => {
            renderRouter({ index: jest.fn(() => <AuthScreen/>), 'screens/Login': jest.fn(() => <Login/>)});

            fireEvent.press(screen.getByText("Login").parent!);

            expect(screen).toHavePathname("/screens/Login");
        })

        it("Navigate to Sign Up page", () => {
            renderRouter({ index: jest.fn(() => <AuthScreen/>), 'screens/Login': jest.fn(() => <SignUp/>)});

            fireEvent.press(screen.getByText("Sign Up").parent!);

            expect(screen).toHavePathname("/screens/SignUp");
        })

    });

    // Login Page Tests
    describe("Login Page Tests", () => {

        let fetchMock = jest.spyOn(global, "fetch").mockImplementation(jest.fn());

        beforeEach(() => {
            jest.clearAllMocks();
        })
        
        it("Default text and buttons render correctly", () => {
            render(<Login/>);

            const loginButton = screen.getByText("Login");

            expect(screen.getByPlaceholderText("Enter your email")).toBeOnTheScreen();
            expect(screen.getByPlaceholderText("Enter your password")).toBeOnTheScreen();
            expect(loginButton).toBeOnTheScreen();
            expect(screen.getByText("Forgot password?")).toBeOnTheScreen();
            expect(screen.queryByTestId("Activity Indicator")).not.toBeOnTheScreen();
            expect(screen.queryByRole("Toast")).not.toBeOnTheScreen();
        })

        it("Missing Fields toast message renders correctly with no fields filled", async () => {
            render(<Login/>);

            const loginButton = screen.getByText("Login");

            fireEvent.press(loginButton);
            
            // Make sure the missing fields toast message appears
            expect(await screen.findByText("Missing Fields")).toBeTruthy();
        })

        it("Missing Fields toast message renders correctly with just email field filled", async () => {
            render(<Login/>);

            const loginButton = screen.getByText("Login");
            const emailField = screen.getByPlaceholderText("Enter your email");

            await userEvent.type(emailField, "test");
            fireEvent.press(loginButton);

            expect(await screen.findByText("Missing Fields")).toBeTruthy();
        })

        it("Missing Fields toast message renders correctly with just password field filled", async () => {
            render(<Login/>);

            const loginButton = screen.getByText("Login");
            const passwordField = screen.getByPlaceholderText("Enter your password");

            await userEvent.type(passwordField, "test");
            fireEvent.press(loginButton);

            expect(await screen.findByText("Missing Fields")).toBeTruthy();
        })

        it("Login Failed toast messages render correctly when presented with invalid credentials", async () => {
            fetchMock.mockReturnValueOnce(Promise.resolve({status: 401, ok: false, json: () => Promise.resolve({})} as Response));

            render(<Login/>);

            const loginButton = screen.getByText("Login");
            const emailField = screen.getByPlaceholderText("Enter your email");
            const passwordField = screen.getByPlaceholderText("Enter your password");

            await userEvent.type(emailField, "test1");
            await userEvent.type(passwordField, "test2");

            fireEvent.press(loginButton);

            expect(fetchMock).toHaveBeenCalledWith("http://3.85.25.255:3000/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: "test1".trim(), password: "test2" })})

            expect(await screen.findByText("Invalid email or password.")).toBeTruthy();
        })

        it ("Login Failed toast message renders correctly when presented with unexpected status code", async () => {
            fetchMock.mockReturnValueOnce(Promise.resolve({status: 402, ok: false, json: () => Promise.resolve({})} as Response));

            render(<Login/>);

            const loginButton = screen.getByText("Login");
            const emailField = screen.getByPlaceholderText("Enter your email");
            const passwordField = screen.getByPlaceholderText("Enter your password");

            await userEvent.type(emailField, "test1");
            await userEvent.type(passwordField, "test2");

            fireEvent.press(loginButton);

            expect(await screen.findByText("Something went wrong.")).toBeTruthy();
        })

        it ("Login Succeeded toast message renders correctly", async () => {
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));

            render(<Login/>);

            const loginButton = screen.getByText("Login");
            const emailField = screen.getByPlaceholderText("Enter your email");
            const passwordField = screen.getByPlaceholderText("Enter your password");

            await userEvent.type(emailField, "test1");
            await userEvent.type(passwordField, "test2");

            fireEvent.press(loginButton);

            expect(await screen.findByText("Success")).toBeTruthy();
        })
        
        it("Navigate to resetEmail page when Forgot Password button clicked", () => {
            renderRouter({ index: jest.fn(() => <Login/>), '/screens/resetEmail': jest.fn(() => <VerifyEmail/>)});

            fireEvent.press(screen.getByText("Forgot password?"));

            expect(screen).toHavePathname("/screens/resetEmail");
        })

        // it("Navigate to Home Page after successful login", async () => {
        //     AsyncStorageMock.setItem = jest.fn(() => Promise.resolve());
        //     jest.useFakeTimers();
        //     fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({ cognitoSub: "test" })} as Response));

        //     renderRouter({ 'screens/Login': jest.fn(() => <Login/>), 'tabs/HomeScreen': jest.fn(() => <HomeScreen/>) }, { initialUrl: 'screens/Login' });

        //     const loginButton = screen.getByText("Login");
        //     const emailField = screen.getByPlaceholderText("Enter your email");
        //     const passwordField = screen.getByPlaceholderText("Enter your password");

        //     await userEvent.type(emailField, "test1");
        //     await userEvent.type(passwordField, "test2");

        //     fireEvent.press(loginButton);

        //     jest.advanceTimersByTime(1000);
            
        //     await waitFor(async () => {
        //         expect(screen).toHavePathname("tabs/HomeScreen");
        //     });
        // })

    })

    // Reset Email Page Tests
    describe("Reset Email Page Tests", () => {

        beforeEach(() => {
            jest.clearAllMocks();
        })

        it("Default components render correctly", () => {
            render(<VerifyEmail/>);

            expect(screen.getByText("Email")).toBeOnTheScreen();
            expect(screen.getByPlaceholderText("Enter your email")).toBeOnTheScreen();
            expect(screen.getByText("Send Verification")).toBeOnTheScreen();
            expect(screen.queryByRole("Toast")).not.toBeOnTheScreen();
        })

        it("Toast message renders correctly when email field is empty", async () => {
            render(<VerifyEmail/>);

            const button = screen.getByText("Send Verification");

            fireEvent.press(button);

            expect(await screen.findByText("Missing Email")).toBeTruthy();
        })

        it("Toast message renders correctly when email can't be verified", async () =>{
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: false, json: () => Promise.resolve({})} as Response));

            render(<VerifyEmail/>);

            const button = screen.getByText("Send Verification");
            const email = screen.getByPlaceholderText("Enter your email");

            await userEvent.type(email, "test");
            fireEvent.press(button);

            expect(await screen.findByText("Verification Failed")).toBeTruthy();
        })

        it("Toast message renders correctly when email is verified", async () => {
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));

            render(<VerifyEmail/>);

            const button = screen.getByText("Send Verification");
            const email = screen.getByPlaceholderText("Enter your email");

            await userEvent.type(email, "test");
            fireEvent.press(button);

            expect(await screen.findByText("Verification Sent")).toBeTruthy();
        })

        it("Navigate to Reset Password Page", async () => {
            jest.useFakeTimers();
            const encodingMock = jest.spyOn(global, "encodeURIComponent").mockImplementation((x: any) => x)
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
            jest.spyOn(global, "encodeURIComponent").mockReturnValueOnce("test");

            renderRouter({'/screens/resetEmail': jest.fn(() => <VerifyEmail/>), '/screens/resetPassword?email=test': jest.fn(() => <Verification/>)}, {initialUrl: '/screens/resetEmail'});

            expect(screen).toHavePathname("/screens/resetEmail");

            const button = screen.getByText("Send Verification");
            const email = screen.getByPlaceholderText("Enter your email");

            await userEvent.type(email, "test");
            fireEvent.press(button);

            jest.advanceTimersByTimeAsync(1000);

            await waitFor(async () => {
                expect(screen).toHavePathnameWithParams("/screens/resetPassword?email=test");
            });
        }) 
    })

    describe("Reset Password Page Tests", () => {

        beforeEach(() => {
            jest.clearAllMocks();
        })

        it("Default text and buttons render correctly", () => {
            renderRouter({index: jest.fn(() => <Verification/>)});

            expect(screen.getByPlaceholderText("Enter the code sent to your email")).toBeOnTheScreen();
            expect(screen.getByPlaceholderText("Enter new password")).toBeOnTheScreen();
            expect(screen.getByPlaceholderText("Confirm new password")).toBeOnTheScreen();
            expect(screen.getByText("Reset Password")).toBeOnTheScreen();
        })

        describe("Toast message renders correctly when fields are empty", () => {

            it("All fields empty", async () => {
                render(<Verification/>);

                const button = screen.getByText("Reset Password");
                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })

            it("Verification code empty", async () => {
                render(<Verification/>);

                const password = screen.getByPlaceholderText("Enter new password");
                const confirmation = screen.getByPlaceholderText("Confirm new password");
                const button = screen.getByText("Reset Password");

                await userEvent.type(password, "test");
                await userEvent.type(confirmation, "test");

                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })

            it("Verification code and confirmation field empty", async () => {
                render(<Verification/>);

                const password = screen.getByPlaceholderText("Enter new password");
                const button = screen.getByText("Reset Password");

                await userEvent.type(password, "test");

                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })

            it("Verification code and password field empty", async () => {
                render(<Verification/>);

                const confirmation = screen.getByPlaceholderText("Confirm new password");
                const button = screen.getByText("Reset Password");

                await userEvent.type(confirmation, "test");

                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })

            it("Password field empty", async () => {
                render(<Verification/>);

                const verification = screen.getByPlaceholderText("Enter the code sent to your email");
                const confirmation = screen.getByPlaceholderText("Confirm new password");
                const button = screen.getByText("Reset Password");

                await userEvent.type(verification, "test");
                await userEvent.type(confirmation, "test");

                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })

            it("Password and confirmation field empty", async () => {
                render(<Verification/>);

                const verification = screen.getByPlaceholderText("Enter the code sent to your email");
                const button = screen.getByText("Reset Password");

                await userEvent.type(verification, "test");

                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })

            it("Confirmation field empty", async () => {
                render(<Verification/>);

                const verification = screen.getByPlaceholderText("Enter the code sent to your email");
                const password = screen.getByPlaceholderText("Enter new password");
                const button = screen.getByText("Reset Password");

                await userEvent.type(verification, "test");
                await userEvent.type(password, "test");

                fireEvent.press(button);

                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })
        })

        it("Toast message renders correctly when passwords mismatch", async () => {
            render(<Verification/>);

            const verification = screen.getByPlaceholderText("Enter the code sent to your email");
            const password = screen.getByPlaceholderText("Enter new password");
            const confirmation = screen.getByPlaceholderText("Confirm new password");
            const button = screen.getByText("Reset Password");

            await userEvent.type(verification, "test");
            await userEvent.type(password, "test");
            await userEvent.type(confirmation, "teehee");

            fireEvent.press(button);

            expect(await screen.findByText("Passwords Do Not Match")).toBeTruthy();
        })

        it("Toast message renders correctly when password successfully reset", async () => {
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));

            render(<Verification/>);

            const verification = screen.getByPlaceholderText("Enter the code sent to your email");
            const password = screen.getByPlaceholderText("Enter new password");
            const confirmation = screen.getByPlaceholderText("Confirm new password");
            const button = screen.getByText("Reset Password");

            await userEvent.type(verification, "test");
            await userEvent.type(password, "test");
            await userEvent.type(confirmation, "test");

            fireEvent.press(button);

            expect(await screen.findByText("Password Reset Successful")).toBeTruthy();
        })

        it("Toast message renders correctly when response status is not ok", async () => {
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: false, json: () => Promise.resolve({message: "Test Error Message"})} as Response));

            render(<Verification/>);

            const verification = screen.getByPlaceholderText("Enter the code sent to your email");
            const password = screen.getByPlaceholderText("Enter new password");
            const confirmation = screen.getByPlaceholderText("Confirm new password");
            const button = screen.getByText("Reset Password");

            await userEvent.type(verification, "test");
            await userEvent.type(password, "test");
            await userEvent.type(confirmation, "test");

            fireEvent.press(button);

            expect(await screen.findByText("Test Error Message")).toBeTruthy();
        })

        it("Navigate to Login Page after completing reset", async () => {
            jest.useFakeTimers();
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));

            renderRouter({ 'screens/resetPassword': jest.fn(() => <Verification/>,), 'screens/Login': jest.fn(() => <Login/>) }, { initialUrl: 'screens/resetPassword' });

            const verification = screen.getByPlaceholderText("Enter the code sent to your email");
            const password = screen.getByPlaceholderText("Enter new password");
            const confirmation = screen.getByPlaceholderText("Confirm new password");
            const button = screen.getByText("Reset Password");

            await userEvent.type(verification, "test");
            await userEvent.type(password, "test");
            await userEvent.type(confirmation, "test");

            fireEvent.press(button);

            jest.advanceTimersByTimeAsync(1000);

            await waitFor(async () => {
                expect(screen).toHavePathname("/screens/Login");
            });
        })
    })
})


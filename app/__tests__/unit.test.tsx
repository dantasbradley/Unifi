import React from "react";
import { fireEvent, render, userEvent, waitFor } from "@testing-library/react-native";
import { renderRouter, screen } from 'expo-router/testing-library';
import AuthScreen from "../screens/AuthScreen";
import Login from "../screens/Login";
import { ReactTestInstance } from "react-test-renderer";
import { press } from "@testing-library/react-native/build/user-event/press";
import SignUp from "../screens/SignUp";
import Toast from "react-native-toast-message";

jest.mock("@react-native-async-storage/async-storage", () => {
    require('@react-native-async-storage/async-storage/jest/async-storage-mock');
})

describe("Front End Tests", () => {

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
            const emailField = screen.getByPlaceholderText("Enter your email");
            const passwordField = screen.getByPlaceholderText("Enter your password");

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

    })
})


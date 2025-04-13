import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { renderRouter, screen } from 'expo-router/testing-library';
import AuthScreen from "../screens/AuthScreen";
import Login from "../screens/Login";
import { ReactTestInstance } from "react-test-renderer";
import { press } from "@testing-library/react-native/build/user-event/press";
import SignUp from "../screens/SignUp";

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

        it("Toast messages appear correctly", async () => {
            render(<Login/>);

            const loginButton = screen.getByText("Login");

            fireEvent.press(loginButton);

            // Make sure the missing fields toast message appears
            await waitFor(async () => {
                expect(await screen.findByText("Missing Fields")).toBeTruthy();
            })
        })

    })
})


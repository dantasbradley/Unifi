import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { renderRouter, screen } from 'expo-router/testing-library';
import AuthScreen from "../screens/AuthScreen";
import { ReactTestInstance } from "react-test-renderer";

// Auth Page Tests
describe("Auth Screen", () => {

    it("Should go to Login Page", () => {
        const page = renderRouter({}, { initialUrl: '/screens/AuthScreen' });

        const links = page.getByTestId("login");

        fireEvent.press(links.children[0] as ReactTestInstance);

        expect(page).toHavePathname('/screens/Login');
    });

})
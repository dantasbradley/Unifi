import React from "react";
import { fireEvent, render, userEvent, waitFor } from "@testing-library/react-native";
import { renderRouter, screen } from 'expo-router/testing-library';
import AuthScreen from "../screens/AuthScreen";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import VerifyEmail from "../screens/resetEmail";
import Verification from "../screens/resetPassword";
import HomeScreen from "../tabs/HomeScreen";
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import CheckButton from '../components/CheckButton';
import CustomButton from '../components/CustomButton';
import Sidebar from '../components/Sidebar';
import ProfileScreen from "../tabs/ProfileScreen";
import CalendarScreen from "../tabs/CalendarScreen";
import CommunityCard from "../components/ExploreComponents/CommunityCard";
import CreateCommunityModal from "../components/ExploreComponents/CreateCommunityModal";
import EditToggleButton from "../components/ExploreComponents/EditToggleButton";
import EventCard from "../components/ExploreComponents/EventCard";
import PostCard from "../components/ExploreComponents/PostCard";
import TabLayout from "../tabs/_layout";
import NotificationScreen from "../tabs/NotificationScreen";
import ExploreScreen from "../tabs/ExploreScreen";

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null
}));

jest.mock("react-native-google-places-autocomplete");

let fetchMock = jest.spyOn(global, "fetch").mockImplementation(jest.fn());

jest.mock('../components/Hamburger', () => ({
  useHamburger: () => ({
    isSidebarOpen: true,
    toggleSidebar: jest.fn(),
    closeSidebar: jest.fn(),
  })
}));

jest.mock("@react-native-async-storage/async-storage", () => 
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

describe('Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('CheckButton toggles state on press', () => {
    const { getByText } = render(<CheckButton text="Test Label" />);
    const label = getByText('Test Label');

    fireEvent.press(label);
    fireEvent.press(label);
  });

  test('CustomButton calls onPress', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <CustomButton title="Click Me" onPress={onPressMock} />
    );
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalled();
  });

  test('Sidebar renders with organization titles', async () => {
    const { getByText } = render(<Sidebar />);

    await waitFor(() => {
      expect(getByText('My Organizations')).toBeTruthy();
    });
  });

  test('CommunityCard calls onPress and onToggleJoin correctly', () => {
    const onPressMock = jest.fn();
    const onToggleJoinMock = jest.fn();
    const { getByText } = render(<CommunityCard isAdmin={false} onPress={onPressMock} onToggleJoin={onToggleJoinMock} isJoined={true} community={{ id: 'id', name: 'name', description: 'description', membersCount: 'members', location: 'location', imageUrl: 'imageUrl'}}/>);

    fireEvent.press(getByText("name"));
    expect(onPressMock).toHaveBeenCalled();
    expect(onToggleJoinMock).not.toHaveBeenCalled();
    fireEvent.press(getByText(new RegExp('Join')));
    expect(onToggleJoinMock).toHaveBeenCalled();
    expect(onPressMock).toHaveBeenCalledTimes(1);
  })

  test('CommunityCard renders with correct props', () => {
    const onPressMock = jest.fn();
    const onToggleJoinMock = jest.fn();
    const { getByText } = render(<CommunityCard isAdmin={true}
        onPress={onPressMock} 
        onToggleJoin={onToggleJoinMock} 
        isJoined={true} 
        community={{ id: 'id', name: 'name', description: 'description', membersCount: 'members', location: 'location', imageUrl: "test url" }}/>);

    expect(getByText('name')).toBeOnTheScreen();
    expect(getByText('members')).toBeOnTheScreen();
    expect(getByText('location')).toBeOnTheScreen();
  })

  test('CreateCommunityModal calls onClose, onChangeName, onChangeLocation, and onCreate correctly', () => {
    const onCloseMock = jest.fn();
    const onChangeNameMock = jest.fn();
    const onChangeLocationMock = jest.fn();
    const onCreateMock = jest.fn();
    const { getByText, getByPlaceholderText, getByTestId } = render(<CreateCommunityModal 
        onClose={onCloseMock} 
        onChangeLocation={onChangeLocationMock} 
        onChangeName={onChangeNameMock}
        onCreate={onCreateMock}
        visible={true}
        newCommunityName="community name"
        newCommunityLocation="community location"/>);
    
    fireEvent.press(getByTestId("close"));
    expect(onCloseMock).toHaveBeenCalled();
    fireEvent.changeText(getByPlaceholderText("Enter community name"));
    expect(onChangeNameMock).toHaveBeenCalled();
    //fireEvent.changeText(getByPlaceholderText("Enter community location"));
    //fireEvent.press(getByPlaceholderText("Enter community location"));
    //expect(onChangeLocationMock).toHaveBeenCalled();
    fireEvent.press(getByText("Post"));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    //expect(onChangeLocationMock).toHaveBeenCalledTimes(1);
    expect(onChangeNameMock).toHaveBeenCalledTimes(1);
    expect(onCreateMock).toHaveBeenCalledTimes(1);
  })

  test('CreateCommunityModal returns null if visible is false', () => {
    const onCloseMock = jest.fn();
    const onChangeNameMock = jest.fn();
    const onChangeLocationMock = jest.fn();
    const onCreateMock = jest.fn();
    const { queryByTestId } = render(<CreateCommunityModal 
        onClose={onCloseMock} 
        onChangeLocation={onChangeLocationMock} 
        onChangeName={onChangeNameMock}
        onCreate={onCreateMock}
        visible={false}
        newCommunityName="community name"
        newCommunityLocation="community location"/>);

    expect(queryByTestId("parent")).toBeNull();
  })

  test('EditToggleButton calls onPress correctly', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<EditToggleButton
        onPress={onPressMock}
        editMode={true}/>);
    
    fireEvent.press(getByTestId("test"));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  })

  test('EventCard renders with correct props', () => {
    const toggleAttendMock = jest.fn();
    const { getByText } = render(<EventCard isAdmin={true} isAttending={true} onToggleAttend={toggleAttendMock}
        event={{
            id: 'id',
            date: 'test date',
            location: 'test location',
            title: 'test title',
            description: 'test description',
            start_time: 'April 22, 2025 05:32:00',
            end_time: 'April 22, 2025 05:32:00',
            created_at: 'April 22, 2025 05:32:00',
            updated_at: 'April 22, 2025 05:32:00',
            datetime: 'test date',
            attending: 5,
            clubName: 'test club name',
            clubImageUrl: 'test image url'
        }}/>);

    expect(getByText("test location")).toBeOnTheScreen();
    expect(getByText("test title")).toBeOnTheScreen();
    expect(getByText("test description")).toBeOnTheScreen();
    expect(getByText("5")).toBeOnTheScreen();
  })

  test('PostCard renders with correct props', () => {
    const toggleLikeMock = jest.fn();
    const { getByText } = render(<PostCard isLiked={true} onToggleLike={toggleLikeMock}
        post={{
            id: 'id',
            content: 'test content',
            likes: 10,
            comments: 3,
            title: 'test title',
            created_at: 'April 22, 2025 05:32:00',
            updated_at: 'April 22, 2025 05:32:00',
            clubImageUrl: 'test club image url',
            clubName: 'test club',
            postImageUrl: 'test post image url'
        }}/>);

    expect(getByText('test title')).toBeOnTheScreen();
    expect(getByText("test club")).toBeOnTheScreen();
    expect(getByText("test content")).toBeOnTheScreen();
    expect(getByText("10")).toBeOnTheScreen();
  })

  test('CheckButton renders with correct props', () => {
    const { getByText } = render(<CheckButton text="test text"/>);
    expect(getByText("test text")).toBeOnTheScreen();
  })
});

describe("Screen Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.mockReset();
    })

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

        it("Navigate to Explore Page after successful login", async () => {
            AsyncStorageMock.setItem = jest.fn(() => Promise.resolve());
            jest.useFakeTimers();
            fetchMock.mockReturnValueOnce(Promise.resolve({ok: true, json: () => Promise.resolve({ cognitoSub: "test" })} as Response));

            renderRouter({ 'screens/Login': jest.fn(() => <Login/>), 'tabs/ExploreScreen': jest.fn(() => <ExploreScreen/>) }, { initialUrl: 'screens/Login' });

            const loginButton = screen.getByText("Login");
            const emailField = screen.getByPlaceholderText("Enter your email");
            const passwordField = screen.getByPlaceholderText("Enter your password");

            await userEvent.type(emailField, "test1");
            await userEvent.type(passwordField, "test2");

            fireEvent.press(loginButton);

            jest.advanceTimersByTimeAsync(1000);
            
            await waitFor(async () => {
                expect(screen).toHavePathname("/tabs/ExploreScreen");
            });
        })

    })

    // Reset Email Page Tests
    describe("Reset Email Page Tests", () => {

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

    describe("Profile Screen Tests", () => {

        it("Default components render correctly", () => {
            fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
            const { getByText } = render(<ProfileScreen/>);

            expect(getByText("Account")).toBeOnTheScreen();
        })

    })

    describe("Calendar Screen Tests", () => {

        it("Calendar defaults to correct month", () => {
            const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

            const d = new Date();
            let m = month[d.getMonth()];

            render(<CalendarScreen/>);

            expect(screen.getByText(new RegExp(`${m}`))).toBeOnTheScreen();
        })

    })

    describe("Main App Navigation Tests", () => {

        // it("Navigating from Home to Profile Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/ProfileScreen': ProfileScreen }, { initialUrl: '/tabs/HomeScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/ProfileScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/ProfileScreen');
        //     })
        // })

        // it("Navigating from Home to Notification Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': jest.fn(() => <TabLayout/>), '/tabs/HomeScreen': jest.fn(() => <HomeScreen/>), '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>) }, { initialUrl: '/tabs/HomeScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/NotificationScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/NotificationScreen');
        //     })
        // })

        // it("Navigating from Home to Calendar Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/CalendarScreen': CalendarScreen }, { initialUrl: '/tabs/HomeScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/CalendarScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/CalendarScreen');
        //     })
        // })

        // // it("Navigating from Home to Explore Screen", async () => {
        // //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        // //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/ExploreScreen': ExploreScreen }, { initialUrl: '/tabs/HomeScreen' });

        // //     fireEvent.press(screen.getAllByTestId("/tabs/ExploreScreen")[0]);
        // //     await waitFor(() => {
        // //         expect(screen).toHavePathname('/tabs/ExploreScreen');
        // //     })
        // // })

        // it("Navigating from Profile Screen to Home Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/ProfileScreen': ProfileScreen }, { initialUrl: '/tabs/ProfileScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/HomeScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/HomeScreen');
        //     })
        // })

        // it("Navigating from Profile Screen to Notification Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>), '/tabs/ProfileScreen': ProfileScreen }, { initialUrl: '/tabs/ProfileScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/NotificationScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/NotificationScreen');
        //     })
        // })

        // it("Navigating from Profile Screen to Calendar Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/CalendarScreen': CalendarScreen, '/tabs/ProfileScreen': ProfileScreen }, { initialUrl: '/tabs/ProfileScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/CalendarScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/CalendarScreen');
        //     })
        // })

        // it("Navigating from Notification Screen to Home Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>) }, { initialUrl: '/tabs/NotificationScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/HomeScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/HomeScreen');
        //     })
        // })

        // it("Navigating from Notification Screen to Profile Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/ProfileScreen': ProfileScreen, '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>) }, { initialUrl: '/tabs/NotificationScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/ProfileScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/ProfileScreen');
        //     })
        // })

        // it("Navigating from Notification Screen to Calendar Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/CalendarScreen': CalendarScreen, '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>) }, { initialUrl: '/tabs/NotificationScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/CalendarScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/CalendarScreen');
        //     })
        // })

        // it("Navigating from Calendar Screen to Home Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/CalendarScreen': CalendarScreen }, { initialUrl: '/tabs/CalendarScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/HomeScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/HomeScreen');
        //     })
        // })

        // it("Navigating from Calendar Screen to Profile Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/ProfileScreen': HomeScreen, '/tabs/CalendarScreen': CalendarScreen }, { initialUrl: '/tabs/CalendarScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/ProfileScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/ProfileScreen');
        //     })
        // })

        // it("Navigating from Calendar Screen to Notification Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>), '/tabs/CalendarScreen': CalendarScreen }, { initialUrl: '/tabs/CalendarScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/NotificationScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/NotificationScreen');
        //     })
        // })

        // it("Navigating from Home to Profile to Notification to Calendar to Home Screen", async () => {
        //     fetchMock.mockReturnValue(Promise.resolve({ok: true, json: () => Promise.resolve({})} as Response));
        //     renderRouter({ '_layout': TabLayout, '/tabs/HomeScreen': HomeScreen, '/tabs/ProfileScreen': ProfileScreen, '/tabs/NotificationScreen': jest.fn(() => <NotificationScreen profile="test"/>), '/tabs/CalendarScreen': CalendarScreen }, { initialUrl: '/tabs/HomeScreen' });

        //     fireEvent.press(screen.getAllByTestId("/tabs/ProfileScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/ProfileScreen');
        //     })

        //     fireEvent.press(screen.getAllByTestId("/tabs/NotificationScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/NotificationScreen');
        //     })

        //     fireEvent.press(screen.getAllByTestId("/tabs/CalendarScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/CalendarScreen');
        //     })

        //     fireEvent.press(screen.getAllByTestId("/tabs/HomeScreen")[0]);
        //     await waitFor(() => {
        //         expect(screen).toHavePathname('/tabs/HomeScreen');
        //     })
        // })
    })
})


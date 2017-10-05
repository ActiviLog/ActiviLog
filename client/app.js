import React from "react";
import PropTypes from "prop-types";
import { Route } from 'react-router';
import { Redirect } from 'react-router-dom';

import { BrowserRouter, Switch } from 'react-router-dom';
import { ACCOUNT_TYPE } from "./common/config"
import RedirectRoute from "./pages/RedirectRoute"

// Load our User Object
import User from "./common/models/User"

// Load our components
import Dashboard from './pages/dashboard/';
import Login from './pages/login/';
import Register from './pages/register/';
import Publish from './pages/publish/';
import Activites from './pages/activities/';
import Users from './pages/users/';
import MissingPath from './pages/MissingPath';

import { login as userLogin, set_token, fetchUserData } from './api';
import { saveToken, getToken, clearToken } from './common/utilities/tokenStorage'

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: {
				id: null,
				fullName: null,
				email: null,
				organisationId: null,
				userType: null,
				loggedIn: false,
				token: null,
			},
			error: {
				login: "",
			}
		};

		this.loadUser = this.loadUser.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.forgotPassword = this.forgotPassword.bind(this);
	}

	componentWillMount() {
		this.loadUser();
	}

	loadUser() {		
		const userData = {...this.state.user};

		// Get WebToken from Browser
		userData.token = getToken();
		if (userData.token == null) {
			return;
		}

		// Set endpoints to use token
		set_token(userData.token);

		// Load User data
		let self = this;
		const load = fetchUserData().then(function(response) {
			if (response.status != 401) {
				return response.json()
			} else {
			return false;
			}
		}).then(function(result) {
			if (result && result.success == true) {
				// Update User Profile Object
				userData.id = result.user.id;
				userData.fullName = result.user.fullName;
				userData.email = result.user.email;
				userData.organisationId = result.user.organisationId;
				userData.userType = result.user.userType;
				userData.loggedIn = true;

				self.setState({user: userData});
			} else {
				clearToken();
				userData.token = null;
				
				self.setState({user: userData});
			}
		});
	}

	login(val) {
		const errorData = {...this.state.error};

		// Return if already a login token
		if (this.state.user.token != null) {
			errorData.login = "User is already logged in";
			this.setState({error: errorData});
			return;
		} else {
			errorData.login = "";
			this.setState({error: errorData});
		}

		let self = this;
		userLogin(val.email, val.password, val.organizationName).then(response => response.json()).then(function(result) {
			// Return fail message if login not successful
			if (result.success == false) {
				errorData.login = "Sorry, we could not log you in. Please check your username and password.";
				self.setState({error: errorData});
				return;
			}
			// Save the token in internal browser storage
			const tokenSaved = saveToken(result.token);
			if (tokenSaved == false) {
				errorData.login = "Sorry, we could not log you in. Please check your username and password.";
				self.setState({error: errorData});
				return;
			}
			// Fetch User Data
			window.location.href = "/";
		});
	}

	logout() {
		// Clear Tokens and Refresh the Page
		clearToken();
		window.location.href = "/";
	}

	forgotPassword() {

	}

	render() {
		const {
			user,
			error,
		} = this.state;

		return <div>
			<BrowserRouter>
				<Switch>
					<RedirectRoute
						exact path="/"
						user={user}
						render={(props) => <Dashboard user={user} />}
					/>
					<RedirectRoute
						path="/login"
						user={user}
						render={(props) => <Login login={this.login} loginError={error.login} />}
					/>
					<RedirectRoute
						path="/register"
						user={user}
						render={(props) => <Register user={user} />}
					/>
					<RedirectRoute
						path="/publish*"
						user={user}
						render={(props) => <Publish user={user} />}
					/>
					<RedirectRoute
						path="/activites"
						user={user}
						render={(props) => <Activities user={user} />}
					/>
					<RedirectRoute
						path="/users"
						user={user}
						render={(props) => <Users user={user} />}
					/>
					<RedirectRoute
						path="*"
						user={user}
						component={MissingPath}
					/>
				</Switch>
			</BrowserRouter>
		</div>
	}
};

export default App;

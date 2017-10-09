import React from "react";
import PropTypes from "prop-types";
import { Redirect } from 'react-router-dom';
import validateCharacters from '../../common/utilities/validateCharacters';
import validateEmail from '../../common/utilities/validateEmail';
import validatePassword from '../../common/utilities/validatePassword';

import { check_organization } from '../../api';

import LoginFooter from '../../common/components/LoginFooter';
import Spinner from '../../common/components/Spinner';
require('../../common/styles/style.css');

class Register extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			organizationName: "",
			fullName: "",
			emailAddress: "",
			password: "",
			loading: false,
			error: {
				organization: null,
				email: null,
				password: null,
				fullName: null,
				register: null,
			}
		};

		this.register = this.register.bind(this);
		this.changeField = this.changeField.bind(this);
		this.checkOrganization = this.checkOrganization.bind(this);
	}

	componentDidMount() {
		const path = (location.pathname+location.search).substr(10);

		if (validateCharacters(path)) {
			this.setState({organizationName: path.toString()});
		}
	}

	changeField(evt) {
		if (evt.target.name == "organizationName") {
			if (validateCharacters(evt.target.value)) {
				this.setState({[evt.target.name]: evt.target.value});
				return;
			} else {
				return;
			}
		}

		this.setState({[evt.target.name]: evt.target.value});
	}

	checkOrganization() {
        this.setState({ loading: true });
        let self = this;
        let errors = this.state.error;
        return check_organization(this.state.organizationName).then(response => response.json()).then(function(result) {
			if (result.valid == false) {
				return false;
			} else {
				return true;
            }
		});
	}

	register() {
		this.setState({ loading: true });
		let errors = this.state.error;
		errors.register = "";
		errors.password = "";
		errors.organization =  "";
		errors.email = "";
		errors.fullName = "";
		// Check valid Full Name
		if (this.state.fullName.trim() == "") {
			errors.fullName = "Please enter your name";
		} else {
			errors.fullName = "";
		}
		// Check Email is Valid
		if (validateEmail(this.state.emailAddress) == false) {
			errors.email = "Please enter a valid email address";
		} else {
			errors.email = "";
		}
		if (validatePassword(this.state.password) == false) {
			errors.password = "Please enter a valid password. A valid password contains a minimum of 8 characters, at least one letter, and one number.";
		} else {
			errors.password = "";
		}
		if (this.state.organizationName.trim() == "") {
			errors.organization = "Please enter a valid organization";
		} else {
			errors.organization = "";
		}
		if (errors.fullName !== "" || errors.email !== "" || errors.password !== "" || errors.organization !== "") {
			this.setState({ loading: false });
			this.setState({error: errors});
			return;
		}
		const self = this;
		this.checkOrganization().then(function(outcome) {
			if (outcome == false) {
				errors.organization = "Please enter a valid organization";
			} else {
				errors.organization = "";
			}
			if (errors.fullName == "" && errors.email == "" && errors.password == "" && errors.organization == "") {
				const properties = {
					fullName: self.state.fullName,
					email: self.state.emailAddress,
					password: self.state.password,
					organizationName: self.state.organizationName,
				};
				self.props.register(properties);
				self.setState({ loading: false });
			} else {
				self.setState({ loading: false });
			}
			self.setState({error: errors});
		})
	}

	render() {
		const { 
			organizationName,
			organizationValid,
			emailAddress,
			password,
			fullName,
			loading,
			error,
		} = this.state;

		const {
			registerError,
		} = this.props;

		return <div id="authenticate" className="color-wrap">
			<div className="container">
				<div className="logo">
					<img src={require('../../common/images/logo_text.png')} />
				</div>
				<div className="modal">
					<div className="registrationform">
						<div className="title">
							<h2>Account Registration</h2>
						</div>
						<input
							type="text"
							name="fullName"
							value={fullName}
							onChange={this.changeField}
							placeholder={"Full Name"}
							disabled={loading}
						/>
						{error.fullName && <div className="error">{error.fullName}</div>}
						<input
							type="text"
							name="emailAddress"
							value={emailAddress}
							onChange={this.changeField}
							placeholder={"Email Address"}
							disabled={loading}
						/>
						{error.email && <div className="error">{error.email}</div>}
						<input
							type="password"
							name="password"
							value={password}
							onChange={this.changeField}
							placeholder={"Password"}
							disabled={loading}
						/>
						{error.password && <div className="error">{error.password}</div>}
						<input
							type="text"
							name="organizationName"
							value={organizationName}
							onChange={this.changeField}
							placeholder={"Organization Name"}
							disabled={loading}
						/>
						{error.organization && <div className="error">{error.organization}</div>}
						{registerError && <div className="error">{registerError}</div>}
						<div className="enter">
							<button type="button" className="register" onClick={this.register} disabled={loading}>{loading && <Spinner />}Register</button>
						</div>
					</div>
				</div>
			</div>
			<LoginFooter />
		</div>
	};
};

Register.propTypes = {
	register: PropTypes.func,
	registerError: PropTypes.string,
};

export default Register;

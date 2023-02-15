import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';
import './App.css';
import Profile from './components/Profile';
import Weapons from './components/Weapons';
import GeneralChat from './components/GeneralChat';
import Welcome from './components/Welcome';
import Signin from './components/Signin';
import Signup from './components/Signup';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import Container from 'react-bootstrap/Container';
import axios from 'axios';
import apiUrl from './apiConfig';

class App extends Component{
  constructor(props) {
    super(props)

    this.state = {
      auth: false,
      weapons: [],
      user_id: '',
      username: '',
      favoriteWeapons: []
    }
  }

  // ALL SIGN IN / OUT RELATED METHODS
  userSignedIn = () => {
    this.getAllWeapons()
    this.getUser()
    this.setState({
      auth: true
    })
    setInterval(this.refreshAccessToken, 10000)
  }

  userSignedOut = () => {
    if (localStorage.getItem('user') !== null) {
    axios.patch(`${apiUrl}/api/logout/${localStorage.getItem('user')}`, {
      "token": `${localStorage.getItem('refreshToken')}`
    })
    .then(response => {
      console.log(response.data);
    }).catch(err => {
      console.log('Not Logged In')
    })
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem('refreshToken');
    this.setState({
      auth: false,
    });
  }
  }

   // Check token expiration
  refreshAccessToken = () => {
    const token =localStorage.getItem("refreshToken");
    if (token !== null && token !== undefined) {
        axios.post(`${apiUrl}/api/token/${localStorage.getItem('user')}`, {
          "token": `${localStorage.getItem('refreshToken')}`
        })
        .then((response) => {return response.data})
        .then((result) => {
          localStorage.removeItem('jwt');
          localStorage.setItem('jwt', result.accessToken)
          console.log(localStorage.getItem('jwt'))
        })
    }
  };

  // COMPONENT LIFE CYCLE METHODS
  componentDidMount = () => {
    const token = localStorage.getItem("jwt")
    if(token !== null) {
      this.userSignedIn()
      this.getAllWeapons()
    }
    if (this.state.auth) {
      setInterval(this.refreshAccessToken, 10000)
    }

  }
  componentWillUnmount = () => {
    if (this.state.auth) {
      this.refreshAccessToken();
    }
  }
  // WEAPONS FUNCTIONS
  getAllWeapons = () => {
    //axios get
    axios.get(`${apiUrl}/api/weapons`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`
        }
    })
    .then((response) => {
        return response.data
    }).then((results) => {
        this.setState({
          weapons: results.weapons
        })
    })
  }
  
  handleFavorite = (weapon) => {
    console.log(weapon);
    const weaponChoice = weapon;
    const weaponIndex = this.state.favoriteWeapons.indexOf(weaponChoice);
    let favorites = this.state.favoriteWeapons;
    if (weaponIndex === -1){
      favorites.push(weaponChoice);
    } else {
      favorites.splice(weaponIndex, 1);
    }
    this.setState({
      favoriteWeapons: favorites
    });
  }

  // PROFILE FUNCTIONS
  getUser = () => {
    const userId = localStorage.getItem('user')
        axios.get(`${apiUrl}/api/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        .then((response) => {
          this.setState({
            user_id: response.data.user._id,
            username: response.data.user.username,
            favoriteWeapons: response.data.user.favoriteWeapons
          })
        })
 }

  render() {
    return(
      <>
          <Router>
            <nav className='navbar navbar-expand-lg navbar-light apex-nav'>
              <Link className={'nav-opts'} to="/api/user">Profile</Link>
              <Link className={'nav-opts'} to="/api/weapons">Weapons</Link>
              <Link className={'nav-opts'} to="/api/generalchat">Chat</Link>
              <Link className={'nav-opts'} to="/" onClick={this.userSignedOut}>Logout</Link>
              <Link className={'nav-opts'} to="/api/signin">Sign In</Link>
              <Link className={'nav-opts'} to="/api/signup">Sign Up</Link>
              {/* Work out how to do the logout in the backend */}
            </nav>
            <Routes>
              <Route path="/api/user" element={this.state.auth ? (<Profile user_id={this.state.user_id} username={this.state.username} favoriteWeapons={this.state.favoriteWeapons} />) : (<Navigate replace to = {"/"} />)} />
              <Route path="/api/weapons" element={this.state.auth ? (<Weapons onFavorite={this.handleFavorite} favoriteWeapons={this.state.favoriteWeapons} weapons={this.state.weapons}/>) : (<Navigate replace to = {"/"} />)} />
              <Route path="/api/generalchat" element={this.state.auth ? (<GeneralChat generalChat={this.getGeneralChat} comments={this.state.comments}/>) : (<Navigate replace to = {"/"} />)} />
              <Route path="/api/signin" element={!this.state.auth ? (<Signin userSignedIn={() => this.userSignedIn()}/>) : (<Navigate replace to = {"/"} />)}/>
              <Route path="/api/signup" element={!this.state.auth ? (<Signup />) : (<Navigate replace to = {"/"} />)}/>
              <Route path="/" element={!this.state.auth ? (<div><h1>Welcome to this Apex Legends App!</h1><p>View and favorite any weapon in Apex. Chat with other users from all over the world in the general chat. Just sign up!</p></div>) : (<h1>We will set this to be the page name</h1>)}/>
            </Routes>
          </Router>
        
      </>
      

    )
  }
}

export default App;

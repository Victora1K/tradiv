import React from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from "react-router-dom";
import { ewBalance, DDDSCreen} from '../screens/DDDSCreen';
import { useEffect } from "react";


export function GrabLocalStorage() {
    setTimeout(() => {
        console.log("local grab test")
        //return localStorage.getItem("totalSum")
        document.getElementById('Local1').innerHTML = localStorage.getItem("totalSum")
       }, 10);
}


function Header() {
    useEffect(() => {
        setInterval(GrabLocalStorage, 500);
    }, []);
    return (
    
    <header>
       
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                
                <Navbar.Brand href="/" className='header'> Tradisplan </Navbar.Brand>
              
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <span id='Local1'> {GrabLocalStorage} </span>
                        <Nav.Link href="/record"> Record </Nav.Link>
                        <Nav.Link href="/"> Home </Nav.Link>
                        
                        <span id='Local1'> {GrabLocalStorage} </span>
                        <button className='buttons' onClick={GrabLocalStorage}> New Balance </button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>    
    </header>
    
  )
}

export default Header
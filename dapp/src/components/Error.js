import React from "react";
import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import 'bootstrap/dist/css/bootstrap.min.css';

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function Error() {

  const header = () => {

    return <Navbar fixed="top" collapseOnSelect expand="lg" variant="dark" style={{backgroundColor: "#1F2731" }}>
    <Container>
        <Navbar.Brand href="/">
            <img
            alt=""
            src="/config/images/logo.png"
            height="30"
            className="d-inline-block align-top"
            />{' '}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">

            </Nav>
            
                             

        </Navbar.Collapse>
    </Container>
</Navbar>
      
}

  return (
    <>      

      
      {header()}
      

      <Container fluid className="vh-100 d-flex flex-column" style={{backgroundColor: "#000000", height:"100 vh"}}>
    
      <Row className="text-center" style={{ paddingTop:"100px", color:"#ffffff" }}>
          <Col>
            Oh no! Something happened. We're checking it out. <StyledLink target={"_blank"} href="https://twitter.com/futurenftmints" style={{color:"#ffffff", textDecoration:"underline"}}>Tweet at us</StyledLink> and we'll get back to you.
          </Col>          
        </Row>

      </Container>
      <Card.Footer style={{backgroundColor:"rgb(31, 39, 49)", width:"100%", position: "fixed", bottom:"0px"}}>
        <Row>
          <Col xs={8} md={10} style={{color:"#ffffff"}}>Copyright © <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://futurenftmints.com">Future NFT Mints</StyledLink> 2022</Col>
          <Col xs={4} md={2} style={{textAlign:"right"}}>
            <StyledLink target={"_blank"} href="https://twitter.com/futurenftmints">
              <img
                alt=""
                src="/config/images/twitter.png"
                height="20"
                className="d-inline-block align-top"
                margin="10"
              />{' '}&nbsp;&nbsp;
            </StyledLink>
            <StyledLink target={"_blank"} href="https://discord.gg/futurenftmints">
              <img
                alt=""
                src="/config/images/discord.png"
                height="20"
                margin="10"
                className="d-inline-block align-top"
              />{' '}&nbsp;&nbsp;
            </StyledLink>
            <StyledLink target={"_blank"} href="https://opensea.io/collection/future-nft-mints-genesis-nft">
              <img
                alt=""
                src="/config/images/opensea.png"
                height="20"
                className="d-inline-block align-top"
              />{' '}&nbsp;&nbsp;&nbsp;
            </StyledLink>
          </Col>
        </Row>
      </Card.Footer>

      </>
  );
}

export default Error;

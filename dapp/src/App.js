import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";
import Accordion from "react-bootstrap/Accordion";
import Countdown, { zeroPad } from 'react-countdown';

import 'bootstrap/dist/css/bootstrap.min.css';

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;



export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(0);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const countdownDate = "2022-03-28T18:00:00.000+02:00";
  const countdownRenderer = ({ days, hours, minutes, seconds }) => {
    return <>
      <Col xs={3} md={3}>{zeroPad(days)}</Col>
      <Col xs={3} md={3}>{zeroPad(hours)}</Col>
      <Col xs={3} md={3}>{zeroPad(minutes)}</Col>
      <Col xs={3} md={3}>{zeroPad(seconds)}</Col>
    </>;
  };

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    console.log("totalSupply: ", data.totalSupply)
    console.log("isAllowListMintEnabled: ", data.isAllowListMintEnabled)
    console.log("isPresaleMintEnabled: ", data.isPresaleMintEnabled)
    console.log("isPublicMintEnabled: ", data.isPublicMintEnabled)

    if (data.isAllowListMintEnabled) {
      setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
      setClaimingNft(true);

      if (data.isPublicMintEnabled) {
        publicMint(totalCostWei, totalGasLimit)
      } else if (data.isPresaleMintEnabled) {
        presaleMint(totalCostWei, totalGasLimit)
      } else {
        allowListMint(totalCostWei, totalGasLimit)
      }
    } else {
      console.log('mint phases not enabled')
    }
  };

  const allowListMint = (totalCostWei, totalGasLimit) => {
    blockchain.smartContract.methods
      .allowListMint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit OpenSea to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const presaleMint = (totalCostWei, totalGasLimit) => {
    blockchain.smartContract.methods
      .presaleMint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit OpenSea to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const publicMint = (totalCostWei, totalGasLimit) => {
    blockchain.smartContract.methods
      .publicMint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit OpenSea to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 0;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > maxRemainingPerAddressDuringMint()) {
      newMintAmount = maxRemainingPerAddressDuringMint();
    }
    setMintAmount(newMintAmount);
  };

  const maxRemainingPerAddressDuringMint = () => {
    const presaleLimit = 2,
          publicLimit = 5;

    let limit = 0;
    if (data.isPublicMintEnabled) {
      limit = publicLimit
    } else if (data.isPresaleMintEnabled || data.isAllowListMintEnabled) {
      limit = presaleLimit
    }

    return data.balance >= limit ? 0 : (limit - data.balance);
  }

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  const getFeedback = async () => {
    let currentPhase,
        maxRemainingMint

    let balance = parseInt(data.balance),
        allowListAllocation = parseInt(data.allowListAllocation),
        presaleListAllocation = parseInt(data.presaleListAllocation)

    if (data.isPublicMintEnabled) {
      currentPhase = 'Public'
      maxRemainingMint = 5 - balance
    } else if (data.isPresaleMintEnabled) {
      currentPhase = 'Presale'
      maxRemainingMint = presaleListAllocation - balance
    } else if (allowListAllocation) {
      currentPhase = 'Allow List'
      maxRemainingMint = 2 - balance
    } else {
      maxRemainingMint = 0
      currentPhase = 'this'
    }

    setFeedback(`${blockchain.account} can mint ${maxRemainingMint} during ${currentPhase} phase`)
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getFeedback();
  }, [blockchain.account, data.allowListAllocation, data.presaleListAllocation]);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  const mintPhaseMessage = () => {
    if (data.isPublicMintEnabled) {
      return <Col style={{ textAlign: "left", color: "#ffffff" }}>Public (Wallet Limit 5)</Col>
    } else if (data.isPresaleMintEnabled) {
      return <Col style={{ textAlign: "left", color: "#ffffff" }}>Presale (Wallet Limit 2)</Col>
    } else if (data.isAllowListMintEnabled) {
      return <Col style={{ textAlign: "left", color: "#ffffff" }}>Allow List (Wallet Limit 2)</Col>
    } else {
      return <Col style={{ textAlign: "left", color: "#ffffff" }}>Public (Wallet Limit 5)</Col>
    }
  }

  const progressBar = () => {
    if (blockchain.account!== "" && blockchain.smartContract !== null) {
      return <><Row style={{ paddingTop:"25px" }}>
            <Col>
              <ProgressBar now={data.totalSupply / CONFIG.MAX_SUPPLY * 100} />
            </Col>
          </Row>
          <Row style={{ paddingTop:"5px" }}>
            <Col style={{ textAlign: "left", color: "#ffffff" }}>0.25 ETH</Col>
            <Col style={{ textAlign: "right", color: "#ffffff" }}>{data.totalSupply} / {CONFIG.MAX_SUPPLY}</Col>
          </Row>
          </>
    }
  }

  const connectWalletContainer = () => {
    return <s.Container ai={"center"} jc={"center"}>
      {blockchain.errorMsg !== "" ? (
        <>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "#ffffff",
            }}
          >
            {blockchain.errorMsg}
          </s.TextDescription>
        </>
      ) : null}
      <Button style={{ backgroundColor: "#F83700", border: "#F83700", width:"100%" }}
  onClick={(e) => {
          e.preventDefault();
          dispatch(connect());
          getData();
        } }
      >
        Connect Wallet
      </Button>

    </s.Container>
  }

  const shouldRenderConnectedWalletMintUI = () => {
    return data.isAllowListMintEnabled && parseInt(data.allowListAllocation) && (parseInt(data.allowListAllocation) - parseInt(data.balance) ) > 0 ||
      data.isPresaleMintEnabled && parseInt(data.presaleListAllocation) && (parseInt(data.presaleListAllocation) - parseInt(data.balance) ) ||
      data.isPublicMintEnabled
  }

  const shouldRenderFeedbackMessage = () => {
    return (blockchain.account!== "" && blockchain.smartContract !== null)
  }

  const feedbackMessage = () => {
    return shouldRenderFeedbackMessage() ? <Row
      style={{
        color: "#ffffff",
      }}
    >
      <Col style={{textAlign: "center" }}>{feedback}</Col>
    </Row> : null
  }

  const connectedWalletMintUI = () => {    

    return shouldRenderConnectedWalletMintUI() ? <>
      <s.SpacerMedium />
      <s.Container ai={"center"} jc={"center"} fd={"row"}>
        <StyledRoundButton
          style={{ lineHeight: 0.4 }}
          disabled={claimingNft ? 1 : 0}
          onClick={(e) => {
            e.preventDefault();
            decrementMintAmount();
          } }
        >
          -
        </StyledRoundButton>
        <s.SpacerMedium />
        <s.TextDescription
          style={{
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          {mintAmount}
        </s.TextDescription>
        <s.SpacerMedium />
        <StyledRoundButton
          disabled={claimingNft ? 1 : 0}
          onClick={(e) => {
            e.preventDefault();
            incrementMintAmount();
          } }
        >
          +
        </StyledRoundButton>
      </s.Container>
      <s.SpacerSmall />
      <s.Container ai={"center"} jc={"center"} fd={"row"}>
      <Button style={{ backgroundColor: "#F83700", border: "#F83700", width:"100%" }}
          disabled={claimingNft ? 1 : 0}
          onClick={(e) => {
            e.preventDefault();
            claimNFTs();
            getData();
          } }
        >
          {claimingNft ? "BUSY" : "BUY"}
        </Button>
      </s.Container>
    </> : null
  }

  const header = () => {

    return <Navbar collapseOnSelect expand="lg" variant="dark" style={{backgroundColor: "#000000", position:"fixed", width:"100%", zIndex:"100" }}>
        <Container>
          <Navbar.Brand href="#home">
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
            <Nav>

              <Nav.Link href="#benefits" style={{ color: "#ffffff", verticalAlign: "baseline" }}>
                Benefits
              </Nav.Link>
              <Nav.Link href="#roadmap" style={{ color: "#ffffff" }}>
                Roadmap
              </Nav.Link>
              <Nav.Link href="#team" style={{ color: "#ffffff" }}>
                Team
              </Nav.Link>
              <Nav.Link target={"_blank"} href="https://docs.google.com/document/d/169NvaWHpPEKkg6AucydhaOuz_Hn5ecexVfLDoe3mI08/edit#heading=h.z4mifle893rx" style={{ color: "#ffffff" }}>
                White Paper
              </Nav.Link>
              <Nav.Link href="#faqs" style={{ color: "#ffffff" }}>
                FAQs
              </Nav.Link>
              <Nav.Link target={"_blank"} href="https://twitter.com/futurenftmints">
                <img
                  alt=""
                  src="/config/images/twitter.png"
                  height="20"
                  className="d-inline-block align-top"
                />
              </Nav.Link>
              <Nav.Link target={"_blank"} href="https://discord.gg/futurenftmints">
                <img
                  alt=""
                  src="/config/images/discord.png"
                  height="20"
                  className="d-inline-block align-top"
                />
              </Nav.Link>
              <Nav.Link target={"_blank"} href="https://opensea.io/collection/future-nft-mints-genesis-nft">
                <img
                  alt=""
                  src="/config/images/opensea.png"
                  height="20"
                  className="d-inline-block align-top"
                />
              </Nav.Link>
              <Nav.Link target={"_blank"} href="https://app.futurenftmints.com">
                <span className="btn-sm btn-light text-center">Register</span>
              </Nav.Link>
            

            
            {/*
            <StyledLink target={"_blank"} href="https://opensea.io/collection/future-nft-mints-genesis-nft">
              <img
                alt=""
                src="/config/images/opensea.png"
                height="30"
                className="d-inline-block align-top"
              />{' '}&nbsp;&nbsp;&nbsp;
            </StyledLink>

            { (blockchain.account === "" ||  blockchain.smartContract === null) ?
              <Button style={{ backgroundColor: "#F83700", border: "#F83700" }}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(connect());
                  getData();
                } }
              >
                Connect Wallet
              </Button> : null
            }
            */}




            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
}

  return (
    <>      

      {header()}
      

      <Container fluid>

        <Row style={{ paddingTop: "50px", paddingBottom: "20px", backgroundColor: "#000000" }}>
          <Col md={1}></Col>
          <Col md={6}>            
            <Row style={{ paddingTop: "20px", color: "#ffffff", fontSize:"3em", lineHeight: "1em" }}>
              <Col>Guide your buying decisions with access to<br />the most in-depth NFT research and analysis</Col>
            </Row>
            {/*
            <Row style={{ backgroundImage: "linear-gradient(0.15turn, #A11692, #BD2164, #FAC921 60%)", 
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize:"3em", 
                          lineHeight: "1em" }}>
              <Col>the most in-depth NFT research and analysis</Col>
            </Row>
            */}
            <Row style={{ paddingTop: "20px" }}>
              <Row style={{ paddingTop: "20px", color: "#ffffff", fontSize:"1.5em" }}>
                <Col>At Future NFT Mints, we know that it can be hard keeping up with upcoming mint dates and 
                knowing which NFTs to mint. That’s why the Genesis NFT gives you exclusive access to our research 
                and analysis platform.
                <br /><br />
                In addition to our research, you will receive entries to giveaways that we run. 
                The potential prizes for these giveaways include Allow List access to other NFT mints, virtual event access, and IRL invitations. </Col>
              </Row>              
            </Row>
          </Col>
          <Col md={4}>
            <Row style={{ paddingTop:"20px", textAlign: "center" }}>
              <Col><img fluid="true" alt="Future NFT Mints - Genesis NFT Card" src="/config/images/fnftm-card.png" width="80%" className="d-inline-block align-top"/></Col>
            </Row>

            <Row style={{ marginTop:"50px", backgroundColor: "#212529", borderRadius: "5px", marginLeft:"1px", marginRight:"1px" }}>
              <Col>
                <Row style={{ paddingTop:"25px" }}>
                  <Col style={{ textAlign: "center", color: "#ffffff", fontSize:"1.5em" }}>Mint Genesis NFT</Col>
                </Row>

                <Row style={{ paddingTop:"25px" }}>
                  <Col xs={3} style={{ textAlign: "left", color: "#ffffff" }}>PHASE</Col>
                  {mintPhaseMessage()}
                </Row>

                {progressBar()}

                <Row>

                  <Col xs={12} style={{ paddingTop:"25px", textAlign: "center" }}>
                    {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                      <>
                        <s.TextTitle
                          style={{ textAlign: "center", color: "#ffffff" }}
                        >
                          The sale has ended.
                        </s.TextTitle>
                        <s.TextDescription
                          style={{ textAlign: "center", color: "#ffffff" }}
                        >
                          You can still find {CONFIG.NFT_NAME} on
                        </s.TextDescription>
                        <s.SpacerSmall />
                        <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                          {CONFIG.MARKETPLACE}
                        </StyledLink>
                      </>
                    ) : (
                      <>
                        {feedbackMessage()}
                        { blockchain.account === "" || blockchain.smartContract === null ?
                          connectWalletContainer() : connectedWalletMintUI()
                        }
                      </>
                    )}
                  </Col>
                </Row>


                <Row style={{ paddingTop:"20px" }}>
                  <Col>
                  <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://etherscan.io/address/0x5f66F72a4f87ec3Cd06241400bD2bA867F1233c7">Smart Contract on Etherscan</StyledLink>
                  </Col>
                </Row>
                <Row  style={{ paddingBottom:"25px" }}></Row>

              </Col>

            </Row>

          </Col>
          <Col md={1}></Col>
        </Row>
        <Row style={{textAlign:"center", background:"#000000"}}>
          <Col style={{fontSize:"2em", marginTop:"30px", marginBottom:"50px", color:"#ffffff"}}>
            Sign-up for our
            <div style={{ marginTop:"10px"}}>
              <a className="btn-lg btn-light" style={{ textDecoration:"none", marginTop:"10px"}} target={"_blank"} href="https://futurenftmints.substack.com/subscribe">free newsletter</a>
            </div>
          </Col>
        </Row>          
        
        <a id="benefits"></a>
        <Row style={{ paddingTop: "40px", paddingBottom: "40px", backgroundColor: "#202124" }}>
          <Col md={1}></Col>
          <Col md={4}>
            <Row style={{ paddingTop:"20px", color: "#ffffff", fontSize:"2.5em", lineHeight: "1em" }}>
              <Col>Genesis NFT Benefits</Col>
            </Row>
            <Row style={{ paddingTop:"20px", color: "#ffffff", fontSize:"1em", lineHeight: "1em" }}>
              <Col>As a Genesis NFT holder, you will have access to an evolving range of benefits.</Col>
            </Row>
            <Row style={{ paddingTop:"40px", paddingBottom:"20px", color: "#ffffff", fontSize:"1em", lineHeight: "1em" }}>
              <Col>
                <a className="btn-lg btn-light" style={{textDecoration:"none"}} target="_BLANK" href="https://app.futurenftmints.com">Register Your Genesis NFT</a>
              </Col>
            </Row>
          </Col>
          <Col md={3}>
            <Row style={{ paddingTop:"20px", color: "#ffffff", lineHeight: "1em" }}>
              <Col xs={3}>
                <img alt="Token Gated Platform icon" src="/config/images/TokenGatedPlatform.png" width="50px" />
              </Col>
              <Col>
                <div style={{ fontSize: "1.5em" }}>
                  Research Platform
                </div>
                <div style={{ paddingTop: "10px", fontSize:"1em"}}>
                  Launching in May. Discover, research, and track upcoming and existing NFT projects.
                </div>
              </Col>              
            </Row>
            <Row style={{ paddingTop:"30px", color: "#ffffff", lineHeight: "1em" }}>
              <Col xs={3}>
                <img alt="Insights Report icon" src="/config/images/InsightsReport.png" width="50px" />
              </Col>
              <Col>
                <div style={{ fontSize: "1.5em" }}>
                  Insights Report
                </div>
                <div style={{ paddingTop: "10px", fontSize:"1em"}}>
                  Detailed NFT research and analysis. One delivered each weekday via email. 100+ already created.
                </div>
              </Col>                           
            </Row>
            <Row style={{ paddingTop:"30px", color: "#ffffff", lineHeight: "1em" }}>
              <Col xs={3}>
                <img alt="Private Discord icon" src="/config/images/PrivateDiscord.png" width="50px" />
              </Col>
              <Col>
                <div style={{ fontSize: "1.5em" }}>
                  Private Discord
                </div>
                <div style={{ paddingTop: "10px", fontSize:"1em"}}>
                  Connect with other Genesis NFT hodlers. This is where we'll share insights ahead of time.
                </div>
              </Col>              
            </Row>                       
          </Col>
          <Col md={3}>
            <Row style={{ paddingTop:"20px", color: "#ffffff", lineHeight: "1em" }}>
              <Col xs={3}>
                <img alt="NFT Calendar icon" src="/config/images/NFTCalendar.png" width="50px" />
              </Col>              
              <Col>
                <div style={{ fontSize: "1.5em" }}>
                  NFT Calendar
                </div>
                <div style={{ paddingTop: "10px", fontSize:"1em"}}>
                  Built into the Research Platform. Use <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://docs.google.com/spreadsheets/d/1ft3T2Gn-yx3P0FF2whSzkp9_nMAHiCqQZYHLKuSzg_E/edit#gid=259898129">this Google Sheet</StyledLink> until Research Platform launches.
                </div>
              </Col>              
            </Row> 
            <Row style={{ paddingTop:"30px", color: "#ffffff", lineHeight: "1em" }}>
              <Col xs={3}>
                <img alt="Raffle icon" src="/config/images/Raffles.png" width="50px" />
              </Col>
              <Col>
                <div style={{ fontSize: "1.5em" }}>
                  Raffles
                </div>
                <div style={{ paddingTop: "10px", fontSize:"1em"}}>
                  Each Genesis NFT is an entry for Allow List access to NFTs, virtual events, and IRL invitations.
                </div>
              </Col>              
            </Row>
            <Row style={{ paddingTop:"30px", color: "#ffffff", lineHeight: "1em" }}>
              <Col xs={3}>
                <img alt="And more icon" src="/config/images/AndMore.png" width="50px" />
              </Col>
              <Col>
                <div style={{ fontSize: "1.5em" }}>
                  More benefits to come
                </div>
                <div style={{ paddingTop: "10px", fontSize:"1em"}}>
                  Including free NFTs (+ gas) of upcoming collections, and special access within the Research Platform.
                </div>
              </Col>              
            </Row>            
          </Col>
        </Row>
        
        <a id="roadmap"></a>
        <Row style={{backgroundColor:"#000000"}}>
          <Col>
            <Row style={{ paddingTop:"50px", paddingBottom:"25px", fontSize:"2em", textAlign:"center", color:"#ffffff"}}>
              <div>Roadmap</div>
            </Row>
            <Row>
              <div className="timeline">          
                
                <div className="timeline-row">
                  <div className="timeline-time">
                    November 2021
                  </div>
                  <div className="timeline-content">
                    <div>
                      <a style={{ color:"#ffffff", fontSize:"1.25em"}} href="https://twitter.com/futurenftmints/status/1465334744044900358" >First tweet</a>                                        
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    December 2021
                  </div>
                  <div className="timeline-content">
                    <div>
                      <a style={{ color:"#ffffff", fontSize:"1.25em"}} href="https://twitter.com/futurenftmints/status/1466421911118761984" >First Insights Report Analysis</a>                                        
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    January 2022
                  </div>
                  <div className="timeline-content">
                    <div>
                      <a style={{ color:"#ffffff", fontSize:"1.25em"}} href="https://futurenftmints.substack.com/subscribe" >Start Free and Paid Newsletter</a>                                        
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    February 2022
                  </div>
                  <div className="timeline-content">
                    <div>
                      <a style={{ color:"#ffffff", fontSize:"1.25em"}} href="#team" >Recruit Team</a>                                        
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    March 2022
                  </div>
                  <div className="timeline-content">
                    <div>
                      <a style={{ color:"#ffffff", fontSize:"1.25em"}} href="https://mint.futurenftmints.com" >NFT Smart Contract and Genesis Mint Page Launch</a>                                        
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    April 2022
                  </div>
                  <div className="timeline-content">
                    <div style={{ color:"#ffffff", fontSize:"1.25em"}}>
                      Design NFT Research Platform                                        
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    May 2022
                  </div>
                  <div className="timeline-content">
                    <div style={{ color:"#ffffff" }}>
                    <a style={{ color:"#ffffff", fontSize:"1.25em"}} href="https://app.futurenftmints.com" >Launch Token Gated Registration</a>
                      <div className="text-center" style={{ marginTop:"20px"}}>
                        <div>
                          <iframe width="240" src="https://www.youtube.com/embed/4rkwU8tcEZY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-success text-black" style={{ width:"120px"}} >
                        Done
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    June 2022
                  </div>
                  <div className="timeline-content">
                    <div style={{ color:"#ffffff" }}>
                        <div style={{fontSize:"1.25em"}}>Community-Driven Mint Calendar</div>
                        <div style={{ fontSize:"1em", marginTop:"10px"}}>
                          <ul>
                            <li>- Upvote and downvote upcoming NFTs</li>
                            <li>- Access all research and insights in the token gated platform</li>
                            <li>- Add upcoming NFT projects and we'll research them</li>
                          </ul>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-warning text-black" style={{ width:"120px"}} >
                        In Progress
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    July 2022
                  </div>
                  <div className="timeline-content">
                    <div style={{ color:"#ffffff" }}>
                        <div style={{fontSize:"1.25em"}}>Community Sentiment, Search, and More Research</div>
                        <div style={{ fontSize:"1em", marginTop:"10px"}}>
                          <ul>
                            <li>- Specific NFT-community sentiment</li>
                            <li>- Advanced filters, search, and sorting of NFT projects</li>
                            <li>- NFT Collection pages</li>
                          </ul>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-light text-black" style={{ width:"120px"}} >
                        Planned
                      </span>     
                    </div>               
                  </div>
                </div>

                <div className="timeline-row">
                  <div className="timeline-time">
                    August 2022
                  </div>
                  <div className="timeline-content">
                    <div style={{ color:"#ffffff" }}>
                        <div style={{fontSize:"1.25em"}}>Profile Page, Multiple Wallets, and new NFT for 1-year access</div>
                        <div style={{ fontSize:"1em", marginTop:"10px"}}>
                          <ul>
                            <li>- User profile pages</li>
                            <li>- Add multiple wallets</li>
                            <li>- Mint new NFT (supply and price TBD) - Genesis NFT receives 1 for free</li>
                          </ul>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
                      <span className="badge bg-light text-black" style={{ width:"120px"}} >
                        Planned
                      </span>     
                    </div>               
                  </div>
                </div>
                
              </div>              

            </Row>
            <Row>
              <div style={{ padding:"0px 10px", marginBottom:"50px"}}>
                <div className="timeline-future">
                  <div className="row">
                    <div className="col-md-3"></div>
                    <div className="col-md-6 col-12" style={{ background: "#1a233a", borderRadius: "4px", padding: "20px 30px" }}>
                        <div className="row" style={{fontSize:"1.5em", color:"#ffffff", textAlign:"center"}}>
                          <div>Phase 2</div>
                        </div>
                        <div className="row" style={{fontSize:"1em", color:"#ffffff", textAlign:"center", marginTop:"20px"}}>
                          <div>To be announced</div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </Row>
          </Col>
        </Row>
        <div className="col-12" style={{backgroundColor:"#000000", width:"100%"}}>          
          <div className="row">
            
          </div>
        </div>        

        <a id="team"></a>
        <Row style={{ textAlign:"center", paddingTop: "40px", paddingBottom:"20px", backgroundColor: "#202124", color:"#ffffff", lineHeight: "1.25em" }}>
          <div style={{ fontSize: "2em", paddingBottom:"40px" }}>
            The Team
          </div>          
          <Col md={2}></Col>
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Elliot Koss" src="/config/images/team/elliotkoss-founder-futurenftmints.png" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Elliot Koss</div>
            Founder
            <br /><a href="https://twitter.com/elliotkoss" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://linkedin.com/in/elliotkoss" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Mike Taylor" src="/config/images/team/miketaylor-engineer-futurenftmints.jpeg" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Mike Taylor</div>
            Senior Engineer
            <br /><a href="https://twitter.com/sea_local" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://linkedin.com/in/miketayloreit" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Samantha Lane" src="/config/images/team/samanthalane-designer-futurenftmints.jpeg" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Samantha Lane</div>
            Designer
            <br /><a href="https://twitter.com/laneyx" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://www.linkedin.com/in/samanthajlane/" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Mason Tilghman" src="/config/images/team/masontilghman-engineer-futurenftmints.jpeg" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Mason Tilghman</div>
            Engineer
            <br /><a href="https://twitter.com/mas1alpha" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://www.linkedin.com/in/mason-tilghman/" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>
        </Row>

        <Row style={{ textAlign:"center", paddingTop:"10px", paddingBottom: "40px", backgroundColor: "#202124", color:"#ffffff" }}>     
          <Col md={2}></Col>          
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Harrison Smith" src="/config/images/team/harrisonsmith-nft-researcher-futurenftmints.jpeg" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Harrison Smith</div>
            NFT Researcher
            <br /><a href="https://twitter.com/hgrey0001" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://www.linkedin.com/in/harrisongsmith/" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Mike Taylor" src="/config/images/team/krishnabrahmaroutu-nft-researcher-futurenftmints.jpg" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Krishna Brahmaroutu</div>
            NFT Reseacher
            <br /><a href="https://twitter.com/krishnaenae" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://www.linkedin.com/mwlite/in/krishna-brahmaroutu-926251186" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>          
          <Col md={2}>
            <div style={{ paddingTop:"20px"}}></div>
            <img alt="Andrew Cosgrove" src="/config/images/team/andrewcosgrove-legaladvisor-futurenftmints.jpeg" width="200px" />
            <br /><div style={{ fontSize: "1.25em"}}>Andrew Cosgrove</div>
            Legal Advisor
            <br /><a href="https://twitter.com/AndrewTCosgrove" target="_BLANK"><img width="20" src="/config/images/twitter-logo.png" /></a>
            &nbsp;&nbsp;<a href="https://www.linkedin.com/in/andrew-cosgrove-26062784/" target="_BLANK"><img width="20" src="/config/images/linkedin-logo.png" /></a>
          </Col>
        </Row>                      

        <Row fluid style={{ backgroundImage: "linear-gradient(#000000 10%, #A11692, #BD2164)"}}>
          {/*}
          <Row>
            <Col md={3}></Col>
            <Col xs={12} md={7}>
              <Row style={{ paddingTop: "80px", color: "#ffffff", fontSize:"1.5em", lineHeight:"1.25em" }}>
                <Col xs={4}>ALLOW LIST</Col>
                <Col>
                  Mon, March 28 at 12pm ET                
                </Col>
              </Row>
              <Row style={{ paddingTop: "15px", color: "#ffffff", fontSize:"1.5em", lineHeight:"1.25em" }}>
                <Col xs={4}>PRESALE</Col>
                <Col>
                  Wed, March 30 at 12pm ET                
                </Col>
              </Row>
              <Row style={{ paddingTop: "15px", color: "#ffffff", fontSize:"1.5em" }}>
                <Col xs={4}>PUBLIC</Col>
                <Col>Fri, April 1 at 12pm ET</Col>
              </Row>
              <Row style={{ paddingTop: "40px", color: "#ffffff", fontSize:"1.5em" }}>
                <Col xs={4}>PRICE</Col>
                <Col>0.25 ETH</Col>
              </Row>
              <Row style={{ paddingTop: "15px", color: "#ffffff", fontSize:"1.5em" }}>
                <Col xs={4}>QUANTITY</Col>
                <Col>450 + 50 reserved for team and marketing</Col>
              </Row>
            </Col>
          </Row>
          */}

          <Row style={{ paddingTop: "100px" }}>
          <Col style={{ textAlign:"center", fontSize: "2em", color: " #ffffff" }}>
          Lifetime access to Future NFT Mints' analysis and more
            </Col>
          </Row>
          <Row style={{ paddingTop: "25px" }}>
            <Col md={1}></Col>
            <Col md={5} style={{textAlign:"center", paddingBottom:"20px"}}>
                <img
                  alt=""
                  src="/config/images/2022-03-18-FutureNFTMints.png"
                  height="500"
                  className="d-inline-block align-top"
                  margin="10"
                />
            </Col>
            <Col md={5} style={{ fontSize: "1.25em", color: " #ffffff", lineHeight: "1.25em" }}>
              Our Genesis NFT grants lifetime access to ALL research and analysis that <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://futurenftmints.com">Future NFT Mints</StyledLink> produces. NFT owners are immediately eligible to receive our Daily Fresh Mints Newsletter ($550 / year).
              <br /><br />In addition to our research, NFT owners will also receive 1 entry per NFT you own for any giveaway that we run. The potential prizes for these giveaways include (but not limited to) Allow List access to other NFT mints, merchandise, virtual event access, and IRL invitations. Please note that we will not run any giveaways for cash or cash-equivalent prizes.
              <br /><br />We make no promises as to what benefits you may receive for any expansions beyond our research and analysis products. For instance, if we begin selling NFT artwork or candy bars or create a movie or anything that isn’t related to research and analytics, you won’t receive that for free.
            </Col>
          </Row>


          <a id="faqs"></a>
          <Row style={{ paddingTop: "75px" }}>

            <Col md={3}></Col>
            <Col md={6} xs={12} style={{ textAlign:"center", fontSize: "2em", color: " #ffffff" }}>
              Frequently Asked Questions
            </Col>
            <Col md={3}></Col>
          </Row>

          <Row style={{ paddingTop: "20px", paddingBottom: "100px" }}>

            <Col md={2}></Col>
            <Col md={8} xs={12} style={{ textAlign:"left", lineHeight: "1.25em" }}>
              <Accordion alwaysOpen>
                <Accordion.Item eventKey="19" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How much is this mint and how many Genesis NFTs will there be?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  0.25 ETH.
                  <br /><br />500. We are selling 450, and we are reserving 50 for our team and marketing.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="21" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What is the royalty?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  10%. All royalties go to Future NFT Mints, Inc to fund operations.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="7" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What is an NFT?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  ‘NFT’ is an acronym that stands for Non-Fungible Token. An NFT is a digital record that cannot be taken away and is publicly viewable. The technology that makes this possible is the blockchain and smart contracts. If you’re looking to learn more about NFTs, we have a <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://futurenftmints.com/web3-resources.html">resources page</StyledLink> with links to some of the best minds in the space who explain everything in more detail.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="9" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Why did you choose to mint your NFT on Ethereum?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  As of March 2022, Ethereum is the most widely-used blockchain for NFTs. Our primary goal was creating an accessible NFT. Ethereum has known energy consumption issues that are actively being worked on with ETH2.0. If environmental issues are not addressed by Ethereum (at a blockchain level at some point in the future) we can always perform a swap of this Genesis NFT on Ethereum for an equal Genesis NFT on an L2 or other blockchain that is more environmentally friendly. But, as of March 2022, the infrastructure and support for every other blockchains is significantly behind Ethereum meaning that we would have to accept a subpar user experience or secondary market, which was the primary factor in our decision to mint on Ethereum.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="10" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What wallet is supported for this mint?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  MetaMask is the only supported wallet.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="11" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Can I mint from my phone?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  While this mint page has been mobile optimized, we have only performed testing on the desktop version. No promises that the mobile version will work.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="12" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How do I mint a FNFTM Genesis NFT?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  You will need a MetaMask wallet with enough ETH to cover the mint cost (0.25 per NFT) + gas and we recommend that you mint from a laptop or desktop. We performed our testing using the Chrome browser.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="13" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What kind of smart contract was used for the FNFTM Genesis NFT?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  Our smart contract was built starting with the <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://twitter.com/futurenftmints/status/1480600385639182337?s=20&t=iGiwdDCZKmvRDHHfg-ow3g">gas-efficient ERC-721A contract that Azuki pioneered</StyledLink>.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="14" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What is the Allow List?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  The Allow List practically guarantees that you can mint this NFT. If everyone on the list mints AND they mint their total allocation (2 NFTs), then we will run out of NFTs. But we’d basically be the first NFT that everyone who signed up did their mint at the full allocation. The Allow List opens up on March 28 at 12pm ET and those on the list have 48 hours to mint.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="15" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How do I get on the Allow List?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  There are 3 raffles (two require you owning an NFT to be eligible) being run to get a spot on our Allow List. You must submit your email address to be eligible for our raffles.
                  <br /><br />Token-gated raffles: Our frens at Club CPG have 80 spots and our frens at Floor have 40 spots. To be eligible for these raffles, you must own their NFT and submit via their Telegram and Discord, respectively.
                  <br /><br />Public raffle: To be eligible for the public raffle, you will need to <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://discord.gg/futurenftmints">join the Future NFT Mints Discord</StyledLink> and sign up for the raffle. Everyone with the ‘Early Supporter’ status in Discord (already given out and no one else can earn it) will receive 10 raffle spots. Everyone else will receive 1 raffle spot.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="16" style={{marginBottom:"10px"}}>
                <Accordion.Header>What is the Presale?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  The Presale is a 48 hour time period between the Allow List and Public mint that gives everyone who submitted their wallet for one of our 3 raffles a space to mint. It is intended to give our supporters an opportunity to mint while not having to worry about bots.
                  <br /><br />Unlike the Allow List, there is no cap to how many people are eligible for the Presale. If all 1K+ Floor owners signup for the raffle, then 1K+ wallets will be on the Presale. Same thing if a surge of people join our Discord for the public raffle.
                  <br /><br />The Presale does not guarantee you’ll be able to mint, but it does mean you won’t be competing with bots.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="17" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How do I get on the Presale?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  Submit your wallet and info to one of the 3 raffles we are running with Club CPG, Floor, or in our Discord, and you are automatically on the Presale.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="18" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Why do you require our email address to join the raffles for Allow List and Presale spots?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  The Genesis NFT’s primary benefit is that you receive our daily fresh mints newsletter, which is sent via email. It will speed up our ability to onboard NFT owners if we know your wallet and email ahead of time. Otherwise, you will have to take an extra step after you mint in order to get the bulk of your benefits. We will also send you emails before the key mint dates so that you can make sure to be ready.
                  <br /><br />We will not send any additional communications to these emails, so if you want to be on our free newsletter, you’ll have to signup for that separately.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="22" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How much money will this mint generate?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  Assuming we sell all Genesis NFTs: 450 * 0.25 = 112.5 ETH. At $2.5K USD/ETH, that’s $281,250.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="23" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How will the money earned in this mint be used?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  All the money earned from the Genesis Mint will be accounted as revenue for Future NFT Mints, Inc, and it will be used to fund our business. Since these funds are accounted as revenue, Future NFT Mints, Inc may also be required to use some of the funds to pay for taxes.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="25" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What is the roadmap?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  For the next 12 months, our sole focus is building FNFTM into the premiere NFT research and analysis platform. This started with our Insights Report and Premium Analysis, has already expanded to a daily free and paid newsletter plus a weekly video recap of the mints we cover, and we are putting together plans to create a token-gated website.
                  <br /><br />There are no timelines for when we plan to deliver things. Since our first tweet on Nov 29, 2021, we have quietly iterated, making progressively better improvements to our product offering, and the plan is to continue in that direction. But we don’t want to commit to specific dates or timelines at this point since our big picture plans are still coming into focus.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="26" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Who’s the team building FNFTM?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://futurenftmints.com#team">Meet the public team and check out our LinkedIn and Twitter accounts on our main website.</StyledLink>
                  <br /><br />As of March 2022, our founder (Elliot) is the only person working full-time on FNFTM at this time. Everyone else is working part-time. This will change quickly once we sell 50% of our Genesis NFTs.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="27" style={{marginBottom:"10px"}}>
                  <Accordion.Header>How can I buy or sell the FNFTM Genesis NFT after the mint?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://opensea.io/collection/future-nft-mints-genesis-nft">OpenSea</StyledLink>. We recommend that you only use our official links since OpenSea does a bad job removing fake listings.
                  </Accordion.Body>
                </Accordion.Item>                
                <Accordion.Item eventKey="30" style={{marginBottom:"10px"}}>
                  <Accordion.Header>I bought the NFT, but I want to register a different email address to receive the email. What do I do?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  Go to <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://register.futurenftmints.com">register.futurenftmints.com</StyledLink> and follow the instructions.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="31" style={{marginBottom:"10px"}}>
                  <Accordion.Header>What happens if this NFT does not sell out in its first few days?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  We may not build as fast, but we will continue to build. Elliot, the founder, has a 12-month runway secured in the event the mint doesn’t sell out quickly, and this NFT mint page will stay live the entire time. If, after 12 months, this business doesn’t generate enough value to sell out this NFT, Elliot will figure out the next step. But like any entrepreneur, he will likely iterate, iterate, and iterate well before that happens. And if this concept doesn’t hit the spot, he can always pivot. But this is a scenario that is 12 months out, and as Humphrey Bogart from Casablanca said, “I never make plans that far ahead.”
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="0" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Do Future NFT Mints Genesis NFT owners own part of Future NFT Mints?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                    No.
                    <br /><br />The FNFTM Genesis NFT does not give ANY ownership of Future NFT Mints. As a part of the FNFTM Genesis NFT, you will NOT receive lotteries, annuities, royalties, dividends, revenue share, and equity ownership.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Who owns and is responsible for Future NFT Mints?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  As of March 2022, Elliot Koss (<StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://www.linkedin.com/in/elliotkoss/">LinkedIn</StyledLink>, <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://twitter.com/elliotkoss/">Twitter</StyledLink>) is Founder / CEO and  the 100% equity owner of Future NFT Mints, Inc, the Austin-based, Delaware C-corp that owns and operates Future NFT Mints.
                  <br /><br />At the conclusion of the Genesis Mint, Elliot Koss will remain the 100% equity owner of Future NFT Mints, Inc.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2" style={{marginBottom:"10px"}}>
                  <Accordion.Header>Can I invest in Future NFT Mints, Inc?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  As of March 2022, Future NFT Mints is not seeking investment, but Elliot is writing a monthly update to begin creating a track record with accredited investors (angels and VCs) so that if there is ever a valid reason to raise a round, there are investors who are already familiar with the business and its operations to move quickly while providing a fair valuation for the raise.
                  <br /><br />If you’re an accredited investor and would like to receive the monthly investor update, please <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://twitter.com/elliotkoss">DM Elliot on Twitter</StyledLink> with your email and a note about the investor update.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3" style={{marginBottom:"10px"}}>
                  <Accordion.Header>If I buy a FNFTM Genesis NFT, am I a shareholder?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  No.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5" style={{marginBottom:"10px"}}>
                  <Accordion.Header>If I buy a FNFTM Genesis NFT, do I get to vote on how FNFTM operates?</Accordion.Header>
                  <Accordion.Body style={{color:"#fff"}}>
                  No. We may ask you for input, the same way any startup asks their customers what they would like so that we build a product that has good product market fit. But we will not ask NFT owners (simply because they own our NFT) for their opinion on how we operate. Many of our most treasured advisors may own our NFT, but we will seek their advice independent of their NFT ownership.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
            <Col md={2}></Col>
          </Row>
        </Row>


      </Container>
      <Card.Footer style={{backgroundColor:"#000000", width:"100%"}}>
        <Row>
          <Col xs={8} md={10} style={{color:"#ffffff"}}>Copyright © <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://futurenftmints.com">Future NFT Mints</StyledLink> 2022 and beyond</Col>
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

export default App;

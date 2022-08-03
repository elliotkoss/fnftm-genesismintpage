import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { connect } from "../redux/blockchain/blockchainActions";
import { fetchData } from "../redux/data/dataActions";
import * as s from "../styles/globalStyles";
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
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import { render } from "react-dom";

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

function Homepage() {

  //console.log(useParams().referrer);
  let referrer = window.location.pathname.replace("/", "");
  referrer == "" ? referrer = 'none' : referrer;
  const mintAnchor = window.location.pathname + '#mint';
  const benefitsAnchor = window.location.pathname + '#benefits';
  const roadmapAnchor = window.location.pathname + '#roadmap';
  const teamAnchor = window.location.pathname + '#team';
  const faqsAnchor = window.location.pathname + '#faqs';
  const homeAnchor = window.location.pathname;
  //console.log(window.location.pathname, mintAnchor);

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintRemaining, setMintRemaining] = useState();
  const [mintAmount, setMintAmount] = useState(1);
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
    /*
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    console.log("totalSupply: ", data.totalSupply)
    console.log("isAllowListMintEnabled: ", data.isAllowListMintEnabled)
    console.log("isPresaleMintEnabled: ", data.isPresaleMintEnabled)
    console.log("isPublicMintEnabled: ", data.isPublicMintEnabled)
    */

    if (data.isAllowListMintEnabled) {
      setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
      setMintRemaining();
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
        setMintRemaining();
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit OpenSea to view it.`
        );
        setMintRemaining();
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
        setMintRemaining();
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit OpenSea to view it.`
        );
        setMintRemaining();
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
        setMintRemaining();
        setClaimingNft(false);
      })
      .then((receipt) => {
        //console.log('receipt', receipt, 'blockchain', blockchain, 'mintAmount');
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit OpenSea to view it.`
        );
        setMintRemaining();
        axios.get(`https://app.futurenftmints.com/api/referral/${CONFIG.CONTRACT_ADDRESS}/${blockchain.account}/${referrer}/${mintAmount}`); 
        //console.log('sent referral');
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  //console.log( `https://app.futurenftmints.com/api/referral/${CONFIG.CONTRACT_ADDRESS}/${blockchain.account}/${referrer}/${mintAmount}` );

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

    setFeedback(`${blockchain.account}`)
    setMintRemaining(`can mint up to ${maxRemainingMint}`)
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
      return <><Row>
            <Col>
              <div className="progress">
                <div className="progress-bar" role="progressbar" style={{width: `${data.totalSupply / CONFIG.MAX_SUPPLY * 100}%`, backgroundColor:"#F83700"}} aria-valuemin="0" aria-valuemax="100" ></div>
              </div>
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
      <Col style={{textAlign: "center", fontSize:"0.8em", paddingTop:"10px" }}>{feedback}<br />{mintRemaining}</Col>
    </Row> : null
  }

  const connectedWalletMintUI = () => {    

    return shouldRenderConnectedWalletMintUI() ? <>
      <s.SpacerSmall />
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
            marginTop:"auto",
            marginBottom:"auto"
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
      {feedbackMessage()}      
    </> : null
  }



  return (
    <>      

      
      
      

      <Container fluid style={{backgroundColor: "#0F0C1D", height:"100%"}}>

        
        
        
        
        

        <a id="mint"></a>
        <Row style={{ paddingTop:"150px", paddingBottom:"500px", height:"100%", textAlign: "center" }}>          
          <div className="col-md-2"></div>
          <div className="col-md-3">
            <img fluid="true" alt="Future NFT Mints - Genesis NFT Card" src="/config/images/fnftm-card.png" width="200px" className="d-inline-block align-top"/>            
          </div>
        
          <div className="col-md-5">
            <Row style={{ paddingTop:"25px", paddingBottom:"25px" }}>
              <Col style={{ textAlign: "center", color: "#ffffff", fontSize:"1.5em" }}>Mint Genesis NFT</Col>
            </Row>                

            {progressBar()}

            <Row>

              <Col xs={12} style={{ paddingTop:"0px", textAlign: "center" }}>
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
                    
                    { blockchain.account === "" || blockchain.smartContract === null ?
                      connectWalletContainer() : connectedWalletMintUI()
                    }
                  </>
                )}
              </Col>
            </Row>

            <Row style={{ paddingTop:"10px" }}>
              <Col>
              <StyledLink style={{ color:"#fff", textDecoration:"underline", fontSize:"0.6em"}} target={"_blank"} href="https://etherscan.io/address/0x5f66F72a4f87ec3Cd06241400bD2bA867F1233c7">Smart Contract on Etherscan</StyledLink>
              </Col>
            </Row>
            
            <Row  style={{ paddingBottom:"25px" }}></Row>

          </div>
          <div className="col-md-2"></div>

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

export default Homepage;

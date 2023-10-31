"use client";
import React, { useState, useEffect } from "react";
import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { ethers, parseUnits } from "ethers";
import { formatEther } from "@ethersproject/units";
import abi from "./abi.json";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import TextField from '@mui/material/TextField';

const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);
const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider } = hooks;
const contractChain = 11155111;
const contractAddress = "0x136b02f8480763e5f0eb608beb98599f9bfd977e";




export default function Page() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActive = useIsActive();

  const provider = useProvider();
  const [error, setError] = useState(undefined);

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  const handleConnect = () => {
    metaMask.activate(contractChain);
  };

  const handleDisconnect = () => {
    metaMask.resetState();
  };

  const [balance, setBalance] = useState("");
  useEffect(()=>{
    const fetchBalance = async() =>{
      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi , signer)
      const myBalance = await smartContract.balanceOf(accounts[0])
      console.log(formatEther(myBalance));
      setBalance(formatEther(myBalance))
    };
    if (isActive){
      fetchBalance();
    }
  }, [isActive]);

  const[stkValue, setSTKValue] = useState(0);

  const handleSetSTKValue = event =>{
    setSTKValue(event.target.value)
  }

  const handleBuySTK = async () => {
    try {
      if (stkValue <= 0) {
        return;
      }

      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const buyValue = parseUnits(stkValue.toString(), "ether");
      const tx = await smartContract.buy({
        value: buyValue.toString(),
      });
      console.log("Transaction hash:", tx.hash);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              exchange
            </Typography>

            {isActive ? (
              <Stack direction="row" spacing={1}>
                <Chip label= {accounts? accounts[0] : ""} />

                <Button color="inherit" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </Stack>
            ) : (
              <Button color="inherit" onClick={handleConnect}>
                connect
              </Button>
            )}
          </Toolbar>
        </AppBar>
            
            {isActive &&
              <div> balance = {balance} </div>
              }  
            

      </Box>

    

      <div className="container_center">
        <div className="card">
        {/* <p>chainId: {chainId}</p>
        <p>isActive: {isActive.toString()}</p>
        <p>accounts: {accounts ? accounts[0] : ""}</p>
        */}
 <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
      {isActive && (<h3>My Wallet Balance</h3>)}
      {isActive && (<TextField label="Address" value={accounts ? accounts[0] : ""}/>)}<br />
      {isActive && (<TextField  label="STK Balance" value={balance } /> )}<br />
      {isActive && (<h3 >Buy STK Token</h3>)}
      {isActive && (<TextField  label="Enter amount of Ether you want to buy STK Token" defaultValue=""
                  type="number" onChange={handleSetSTKValue} /> )}<br />
      <Button color="success" variant="contained" onClick={handleBuySTK}>
        Buy STK Token
      </Button>
    </Box>
        
         
        </div>
      </div>
    </div>
  );
}

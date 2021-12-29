import React, { useState, useCallback ,useEffect } from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, DialogTitle, DialogContent, Dialog } from '@material-ui/core';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { NoEthereumProviderError, UserRejectedRequestError as UserRejectedRequestErrorInjected } from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector'
import { useEagerConnect, useInactiveListener } from 'utils/hooks.js'
import { injected, walletconnect } from 'constants/connectors';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { useMediaQuery, Grid, Typography, TextField, Button } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import { isEmpty, delay } from 'utils/utility';
import { nftInstance } from 'services/nftInstance';
import { useSnackbar } from 'notistack';
import Image from 'components/UI/Image';
import { BigNumber } from '@ethersproject/bignumber';

const useStyles = makeStyles(theme => ({
    root: {},
    image: {
        boxShadow:
          '25px 60px 125px -25px rgba(80,102,144,.1), 16px 40px 75px -40px rgba(0,0,0,.2)',
        borderRadius: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
          maxWidth: 500,
          marginBottom: 60
        },
      },
    bottomText:{
        textAlign: "center",
        fontSize: "30px",
        color: theme.palette.primary.main,
      },
    walletConnectDialog: {
      backgroundColor: theme.palette.primary.dark
    },

}));

const Mint = props => {
    const { setIsSwapDialog, className, ...rest } = props;
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const isMd = useMediaQuery(theme.breakpoints.up('md'), {
        defaultMatches: true,
    });

    const [amount, setAmount] = useState(1);
    const [mintPrice, setMintAmount] = useState(0.2);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [activatingConnector, setActivatingConnector] = useState();
    const [isWalletConnectDialogOpen, setWalletConnectDialogOpen] = useState(false);

    const { connector, account, chainId, library, error, activate, deactivate, active } = useWeb3React();

    const handleWalletConnectDialogClose = () => {
      setWalletConnectDialogOpen(false);
    };
  
    const handleWalletClick = (value) => {
      setWalletConnectDialogOpen(false);
      if(value === "metamask"){
        activate(injected);
      }else if(value === "walletconnect"){
        activate(walletconnect);
      }
    };

    useEffect(() => {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined)
      }
    }, [activatingConnector, connector])

    const triedEager = useEagerConnect();
    useInactiveListener(!triedEager || !!activatingConnector)
    

    const getErrorMessage = (error) => {
        if (error instanceof NoEthereumProviderError) {
          return `No browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.`
        } else if (error instanceof UnsupportedChainIdError || !error) {
          return "You're connected to an unsupported network. Please change network as Ethereum"
        } else if (
          error instanceof UserRejectedRequestErrorInjected ||
          error instanceof UserRejectedRequestErrorWalletConnect ||
          error instanceof UserRejectedRequestErrorFrame
        ) {
          return 'Please authorize this website to access your Ethereum account.'
        } else {
          console.error(error)
          return 'An unknown error occurred. Check the console for more details.'
        }
    }

    
    const nft = nftInstance(account, chainId, library);

    const metaMaskInstallHandler = () => {
        window.open('https://metamask.io/download', '_blank');
    }
    
    const inputChangeHandler = useCallback(event => {
        const { value } = event.target;
        if(value > 2 || value < 1)
        {
          enqueueSnackbar(`Please input amount under 2.`, { variant: 'error' });
          setAmount(1)
        } else {
          setAmount(value)
        }
    }, [enqueueSnackbar]);

    const connectWallet = async() => {
      if(active){
        deactivate();
      }else{
        setWalletConnectDialogOpen(true);
      }
    }
    const mint = async () => {
        // handleTransaction()
        if(!!error || isEmpty(account))
        {
          enqueueSnackbar(`First, Please fix the error.`, { variant: 'error' });
          return;
        }
        setLoadingStatus(true);
        try{
          let loop = true
          let tx = null
          const championPrice = await nft.championPrice();
          const saleIsActive = await nft.saleIsActive();
          let overrides = {
            value: `${championPrice.mul(amount)}`,
          }
          if(!saleIsActive)
          {
            const { hash: flipSaleStateHash } = await nft.flipSaleState()
            while (loop) {
                tx = await library.getTransactionReceipt(flipSaleStateHash)
                if(isEmpty(tx)) {
                  await delay(200)
                } else {
                    const { hash: mintChampionHash } = await nft.mintCryptoChampions(amount,overrides)
                    while(loop) {
                      tx = await library.getTransactionReceipt(mintChampionHash)
                      if(isEmpty(tx)) {
                        await delay(300)
                      } else {
                        loop = false
                      } 
                    }
                }
            }
          } else {
            const { hash: mintChampionHash } = await nft.mintCryptoChampions(amount,overrides)
            while (loop) {
                tx = await library.getTransactionReceipt(mintChampionHash)
                if(isEmpty(tx)) { 
                  await delay(300)
                } else {
                  loop = false
                } 
            }
          }
          if (tx.status === 1) {
                setLoadingStatus(false)
                enqueueSnackbar(`Minted successfully.`, { variant: 'success' });
                return;
          } else {
            setLoadingStatus(false)
            enqueueSnackbar(`Minted failed.`, { variant: 'error' });
            return;
          }
        }
        catch(error) {
          console.log(error)
            enqueueSnackbar(`Mint failed.`, { variant: 'error' });
            setLoadingStatus(false)
        }
    }
    return (
        <div id='K9nite' className={clsx(classes.root, className)} {...rest}>
            <Grid container spacing={0} direction={isMd ? 'row' : 'column'}>
                <Grid item xs={12} md={6} data-aos={'fade-up'} 
                style={{display: "flex", alignItems:"stretch", justifyContent:"center",padding: theme.spacing(1,2)}}>
                    {/* <video controls autoPlay>
                        <source src="https://vimeo.com/647311294"/>
                        Your browser does not support the video tag.
                    </video> */}
                    <Image
                      src="assets/images/video.gif"
                      alt="Crypto Champions"
                      lazy={false}
                      className={classes.image}
                    />
                </Grid>
                <Grid item container xs={12} md={6} data-aos={'fade-up'}  style={{padding: theme.spacing(1,2)}} alignItems="center">
                    <Grid item xs={12} md={12}>
                        {!active ? <>
                        <Typography align="center">
                            <Button style={{width:"250px", height:"50px"}} sx={{padding:"20px"}} variant="contained" color="primary" size="large" onClick={() => connectWallet()}>Connect Wallet</Button>
                        </Typography>
                        <Typography align="center" style={{ marginTop: '1rem', marginBottom: '1rem', color: 'red' }}>{(!!error || isEmpty(account)) && getErrorMessage(error)}</Typography></>
                        :<>
                        <Typography className={classes.bottomText}>Mint Price : {mintPrice} ETH</Typography>
                        <Typography align="center">
                          <TextField style={{width:"150px", fontSize:"30px"}} label="Token Amount" variant="outlined" color="primary" focused type="number"
                              InputProps={{ inputProps: { min: "1", max: "2", step: "1" } }} value={amount}
                              onChange={inputChangeHandler}/>
                          &nbsp;
                          <Button style={{width:"150px", height:"55px"}} sx={{padding:"2px"}} variant="contained" color="primary" size="large" onClick={() => mint()}>{loadingStatus ? <CircularProgress color="black"size={24}/> : "Mint"}</Button>
                        </Typography>
                        <Typography style={{fontSize: "20px", textAlign:"center"}}>Maximum Mint Amount : 2</Typography>
                        </>}
                        <Typography className={classes.bottomText}>1. Connect your wallet.</Typography>
                        <Typography className={classes.bottomText}>2. Click on Mint Button.</Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Dialog onClose={handleWalletConnectDialogClose} open={isWalletConnectDialogOpen} sx={{width:"400px"}}>
              <DialogTitle className={classes.walletConnectDialog}>Choose wallet</DialogTitle>
              <DialogContent className={classes.walletConnectDialog}>
                <List sx={{ pt: 0 }}>
                  <ListItem autoFocus button onClick={() => handleWalletClick('metamask')}>
                    <ListItemAvatar>
                      <Avatar src="assets/images/metamask.png"></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="MetaMask" />
                  </ListItem>
                  <ListItem autoFocus button onClick={() => handleWalletClick('walletconnect')}>
                    <ListItemAvatar>
                      <Avatar src="assets/images/walletconnect.png"></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="WalletConnect" />
                  </ListItem>
                </List>
              </DialogContent>
            </Dialog>
        </div>
    );
};

Mint.propTypes = {
    /**
     * External classes
     */
    className: PropTypes.string,
};

export default Mint;

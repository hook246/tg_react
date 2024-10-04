import React, { useContext, useEffect, useState } from "react";
import { ParticleNetwork } from "@particle-network/auth";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import axios from "axios";
import {EventBus, BUS_EVENT} from '../../eventBus'
import { Toast } from 'antd-mobile'
import { TonConnectUI } from '@tonconnect/ui'
import { WalletTgSdk } from '@uxuycom/web3-tg-sdk'
import { TonConnectButton } from '@tonconnect/ui-react';
import clsx from 'clsx'
import Modal from '../../components/tonWallet'
import CryptoJS from 'crypto-js'
import FloatingWalletComponent from "../../components/testTon";

const BASE_URL = 'https://api.infinitytest.cc/api/v1';
const DEFAULT_CHAIN_ID = '0x1' // BSC
const WALLET_TYPE = {
  "OKX Wallet": "okx",
  "Solflare": "solflare",
  "Trust": "trust",
  "Phantom": "phantom",
}

export default function HomePage() {

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const walletTgSdk = new WalletTgSdk()
  const { ethereum } = walletTgSdk
  window.uxuyethereum = ethereum
  const [ chainId ,setChainId] = useState("0x1")
  const [ address, setAddress ] = useState("")

  const [btnLoadingConnect, setBtnLoadingConnect] = useState(false)

  const [notification, setNotification] = useState(null)

  const showNotification = (message, isSuccess = true) => {
    setNotification({ message, isSuccess });
    Toast.show({
      content: <div className={clsx('text-body1 font-semibold text-center', isSuccess ? 'text-White' : 'text-White')}>{message}</div>,
      position: 'top',
      maskClassName: 'bg-bg_0',
      duration: 3000
    })
  }

  useEffect(() => {
    //refresh()
    const tg = window?.Telegram?.WebApp;
    if(tg){
      tg.ready();
      tg.expand();
    }
    // 先初始化, 再全屏设置

    window.axios = axios

    window.startCanvas()
    window.eventBus = new EventBus();
    window.gameLoaded = false
    window?.eventBus?.subscribe('GAME_VIEW_LOADED', async (data) => {

    });
    window?.eventBus?.subscribe('USE_WALLET_CONNECT', async (data) => {

    });
  }, []);

  const tonWalletConnect = async () =>{
    const ton = new TonConnectUI()
    await ton.openModal()
  }

  const switchChain = async (chainId) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
      showNotification("Chain switched successfully");
    } catch (error) {
      console.error("Chain switch failed:", error);
      showNotification("Failed to switch chain", false);
    }
  };

  const uxuyWalletConnect = async ()=>{
    setBtnLoadingConnect(true)
    try {
      await ethereum.request({
        method: 'eth_requestAccounts',
        params: [],
      })
      
      //const accounts = await ethereum.request({ method: 'eth_accounts', params: [] })
      //const chainId = await ethereum.request({ method: 'eth_chainId', params: [] })
      //setAddress(accounts[0])
      setChainId(chainId)
      showNotification('Wallet connected successfully')  

      switchChain(DEFAULT_CHAIN_ID)
      
    } catch (error) {
      console.error('Connection failed:', error)
      showNotification('Failed to connect wallet', false)
    }
    setBtnLoadingConnect(false)
  }

  // 定义一个发送 HTTPS 请求的方法
  const postToAuth = (data, path) => {
    if(window.walletPosting){
      return
    }
    window.walletPosting = true
    window.eventBus.publish(BUS_EVENT.SHOW_LOADING);
    axios.post(`${BASE_URL}${path}`, data)
      .then((response) => {
        console.log('Response:', response.data);
        window.walletPosting = false
        //游戏登录页面
        window.eventBus.publish(BUS_EVENT.WALLET_LOGIN, response.data);
      })
      .catch((error) => {
        window.walletPosting = false
        window.walletLoginState = false
        console.error('Error:', error);
      });
  };

  window.tonWalletConnect = tonWalletConnect
  window.uxuyWalletConnect = uxuyWalletConnect

  return (
    
    <div className="container">
      <div id="GameDiv">
    <canvas id="GameCanvas"></canvas>
    {/* <FloatingWalletComponent /> */}
    <div>
      {/* <button onClick={openModal}>打开模态框</button>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h1>这是一个模态框</h1>
        <p>这里是一些内容...</p>
      </Modal> */}

    </div>
  </div>
    </div>
    
  );
}

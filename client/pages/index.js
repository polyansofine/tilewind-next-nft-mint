import { useState, useEffect } from 'react'
import { nftContractAddress } from '../config.js'
import { ethers } from 'ethers'
import axios from 'axios'

import Loader from 'react-loader-spinner'

import NFT from '../utils/EternalNFT.json'

const mint = () => {
  const [mintedNFT, setMintedNFT] = useState(null)
  const [miningStatus, setMiningStatus] = useState(null)
  const [loadingState, setLoadingState] = useState(0)
  const [txError, setTxError] = useState(null)
  const [currentAccount, setCurrentAccount] = useState('')
  const [correctNetwork, setCorrectNetwork] = useState(false)

  // Checks if wallet is connected
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window
    if (ethereum) {
      console.log('Got the ethereum obejct: ', ethereum)
    } else {
      console.log('No Wallet found. Connect Wallet')
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      console.log('Found authorized Account: ', accounts[0])
      setCurrentAccount(accounts[0])
    } else {
      console.log('No authorized account found')
    }
  }

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:' + chainId)

      const rinkebyChainId = '0x4'

      const devChainId = 1337
      const localhostChainId = `0x${Number(devChainId).toString(16)}`

      if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
        alert('You are not connected to the Rinkeby Testnet!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }

  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain:' + chainId)

    const rinkebyChainId = '0x4'

    const devChainId = 1337
    const localhostChainId = `0x${Number(devChainId).toString(16)}`

    if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
      setCorrectNetwork(false)
    } else {
      setCorrectNetwork(true)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    checkCorrectNetwork()
  }, [])

  // Creates transaction to mint NFT on clicking Mint Character button
  const mintCharacter = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          nftContractAddress,
          NFT.abi,
          signer
        )

        let nftTx = await nftContract.createEternalNFT()
        console.log('Mining....', nftTx.hash)
        setMiningStatus(0)

        let tx = await nftTx.wait()
        setLoadingState(1)
        console.log('Mined!', tx)
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTx.hash}`
        )

        getMintedNFT(tokenId)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log('Error minting character', error)
      setTxError(error.message)
    }
  }

  // Gets the minted NFT data
  const getMintedNFT = async (tokenId) => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          nftContractAddress,
          NFT.abi,
          signer
        )

        let tokenUri = await nftContract.tokenURI(tokenId)
        console.log('tokenuri=', tokenUri)
        let data = await axios.get(tokenUri)
        let meta = data.data

        setMiningStatus(1)
        setMintedNFT(meta.image)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
      setTxError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#0B132B] pt-32 text-[#d3d3d3]">
      <div className="trasition transition duration-500 ease-in-out hover:rotate-180 hover:scale-105">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
        </svg>
      </div>
      <h2 className="mb-20 mt-12 text-3xl font-bold">
        Mint your Eternal Domain NFT!
      </h2>
      {currentAccount === '' ? (
        <button
          className="mb-10 rounded-lg bg-black py-3 px-12 text-2xl font-bold shadow-lg shadow-[#6FFFE9] transition duration-500 ease-in-out hover:scale-105"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : correctNetwork ? (
        <button
          className="mb-10 rounded-lg bg-black py-3 px-12 text-2xl font-bold shadow-lg shadow-[#6FFFE9] transition duration-500 ease-in-out hover:scale-110"
          onClick={mintCharacter}
        >
          Mint Character
        </button>
      ) : (
        <div className="mb-20 flex flex-col items-center justify-center gap-y-3 text-2xl font-bold">
          <div>----------------------------------------</div>
          <div>Please connect to the Rinkeby Testnet</div>
          <div>and reload the page</div>
          <div>----------------------------------------</div>
        </div>
      )}

      <div className="mb-20 mt-4 text-xl font-semibold">
        <a
          href={`https://rinkeby.rarible.com/collection/${nftContractAddress}`}
          target="_blank"
        >
          <span className="hover:underline hover:underline-offset-8 ">
            View Collection on Rarible
          </span>
        </a>
      </div>
      {loadingState === 0 ? (
        miningStatus === 0 ? (
          txError === null ? (
            <div className="flex flex-col items-center justify-center">
              <div className="text-lg font-bold">
                Processing your transaction
              </div>
              <Loader
                className="flex items-center justify-center pt-12"
                type="TailSpin"
                color="#d3d3d3"
                height={40}
                width={40}
              />
            </div>
          ) : (
            <div className="text-lg font-semibold text-red-600">{txError}</div>
          )
        ) : (
          <div></div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 text-center text-lg font-semibold">
            Your Eternal Domain Character
          </div>
          <img
            src={mintedNFT}
            alt=""
            className="h-60 w-60 rounded-lg shadow-2xl shadow-[#6FFFE9] transition duration-500 ease-in-out hover:scale-105"
          />
        </div>
      )}
    </div>
  )
}

export default mint

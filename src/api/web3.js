import Web3 from 'web3'
import 'whatwg-fetch'
import { updateReadOnly } from '../updaters/nodes'

let web3,
    provider,
    readOnly = false,
    ready = false,
    injected = false

function setupWeb3(){
  return new Promise(function(resolve,reject){
    if (typeof window.web3 !== 'undefined') {
      //Metamask or Mist

      web3 = new Web3(window.web3.currentProvider);
      provider = web3.currentProvider
      web3.version.getNetwork(function(err, networkId){
        ready = true
        injected = true
        console.log('Mist or Metamask active')
        resolve({web3, provider, readOnly, networkId})
      })
    } else {
      //Localnode
      let url = "http://localhost:8545"

      fetch(url)
        .then(res => {
          console.log('local node active')
          ready = true

        })
        .catch(error => {
          if(error.readyState === 4 && (error.status === 400 || error.status === 200)){
            // the endpoint is active
            console.log('Success')
          } else {
            //Infura
            console.log('The endpoint is not active. Falling back to Infura readOnly mode')
            url = 'https://ropsten.infura.io/BW6Y98TxAjFjImkmjVnG'
            readOnly = true
            updateReadOnly(true)
          }
        })
        .then(res => {
          provider = new Web3.providers.HttpProvider(url)
          web3 = new Web3(provider);
          console.log(web3)
          web3.version.getNetwork(function(err, networkId){
            ready = true
            resolve({web3, provider, readOnly, networkId})
          })
        })

    }
  })
}

function getWeb3(){
  if (ready === false || (typeof window.web3 !== 'undefined' && injected === false)){
    return setupWeb3()
  } else {
    return new Promise(function(resolve,reject){
      web3.version.getNetwork(function(err, networkId){
        resolve({web3, provider, readOnly, networkId})
      })
    })
  }
}

export async function checkAddress(hash){
  let { web3 } = await getWeb3()
  return web3.isAddress(hash)
}

export async function getAccounts() {
  let { web3 } = await getWeb3()
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if(err) reject(err)
      resolve(accounts)
    })
  })
}

export default getWeb3

export { setupWeb3 }

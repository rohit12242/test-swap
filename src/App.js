import React, { useState } from 'react';
import Web3 from 'web3';
import { swapAbi } from './abi/abis';
import {erc20Abi} from './abi/abierc20';
import './App.css';

 // note, contract address must match the address provided by Truffle after migrations
const web3 = new Web3(Web3.givenProvider);
const contractAddr = '0xdEDFD486bcEcb959C84111C16808B4dc015949Ee';
const SwapContract = new web3.eth.Contract(swapAbi, contractAddr);
const daiTokenAddr = '0xad6d458402f60fd3bd25163575031acdce07538d';
const DaiContract = new web3.eth.Contract(erc20Abi,daiTokenAddr);

function App() {
  const [tokenAmt, setTokenAmt] = useState(0);
  const [ethAmt, setEthAmt] = useState(0);
  //const [availableEth, setAvailableEth] = useState(0);

  const handleSwap = async (e) => {
    e.preventDefault();
    const daiTokenAmt = Web3.utils.toWei(tokenAmt,'ether');
    const EtherAmt = Web3.utils.toWei(ethAmt,'ether')/10;
    console.log(daiTokenAmt);
    console.log(EtherAmt);
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const tokenApproveGas = await DaiContract.methods.approve(contractAddr,daiTokenAmt).estimateGas();
    const tokenApprove = await DaiContract.methods.approve(contractAddr,daiTokenAmt).send({from:account,tokenApproveGas});
    const deadline = Math.floor(Date.now()/1000) + 60*20;
   // const gas = await SwapContract.methods.swapErc20ToEth(daiTokenAddr,daiTokenAmt,EtherAmt,deadline).estimateGas();
    const gas = 500000;
    const result = await SwapContract.methods.swapErc20ToEth(daiTokenAddr,daiTokenAmt,EtherAmt,deadline).send({ from: account, gas });
    console.log(result);
  }

  //const handleGet = async (e) => {
   // e.preventDefault();
   // const result = await SimpleContract.methods.get().call();
   // setGetNumber(result);
   // console.log(result);
 // }
	
    const withdrawEth = async (e) => {
	    e.preventDefault();
	    const accounts = await window.ethereum.enable();
	    const account = accounts[0];
	    const availableEth = await SwapContract.methods.ethAmt(account).call();
	    //const gas = await SwapContract.methods.withdrawEth(availableEth).estimateGas();
	    const gas = 500000;
	    const tx = await SwapContract.methods.withdrawEth(availableEth).send({from:account,gas});	
	    console.log(tx);
    }

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSwap}>
          <label>
            Dai Token:
            <input type="text" name="name" value={tokenAmt} onChange={ e => setTokenAmt(e.target.value) }  />
          </label>
	  <label>
	    Minimum Eth:
	    <input type="text" name ="eth name" value={ethAmt} onChange={e => setEthAmt(e.target.value)} />
	  </label>
          <input type="submit" value="Swap Dai to Eth" />
        </form>
        <br/>
	<button onClick={withdrawEth} type="button">Withdraw Ether</button>
      </header>
    </div>
  );
}

export default App;

pragma solidity ^0.8.0;

interface IUniswap{
    function swapExactTokensForETH(uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline) external returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}

interface IERC20{
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function approve(
        address spender,
        uint256 amount
    ) external returns (bool);
}

contract Swap {
    IUniswap uniswap;
    IERC20 token;
    mapping(address=>uint) public ethAmt;

    constructor(address _uniswap){
        uniswap = IUniswap(_uniswap);

    }

    function swapErc20ToEth(address token,uint amountIn,uint amountOutMin,uint deadline) public{
        IERC20(token).transferFrom(msg.sender,address(this),amountIn);
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = uniswap.WETH();
        IERC20(token).approve(address(uniswap),amountIn);
        uniswap.swapExactTokensForETH(amountIn,amountOutMin,path,address(this),deadline);
        ethAmt[msg.sender] = ethAmt[msg.sender]+amountOutMin;
    }

    function withdrawEth(uint value) public{
        require(ethAmt[msg.sender]>= value);
        (bool success, ) = msg.sender.call{value: value}(new bytes(0));
        require(success, 'ETH transfer failed');
        ethAmt[msg.sender] = ethAmt[msg.sender]-value;
    }
    
    receive() external payable{
        
    }
}


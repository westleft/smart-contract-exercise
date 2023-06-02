// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract ManualToken {
  uint256 initialSupply;
  mapping (address => uint) public balanceOf;
  mapping (address => mapping (address => uint256)) public allowance;

  constructor() {}
  function transfer(address _from, address _to, uint256 _amount) public returns (bool success) {
    balanceOf[_from] = balanceOf[_from] - _amount;
    balanceOf[_to] += _amount;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

  }


  // function name() public view returns (string)
  // function symbol() public view returns (string)
  // function decimals() public view returns (uint8)
  // function totalSupply() public view returns (uint256)
  // function balanceOf(address _owner) public view returns (uint256 balance)
  // function approve(address _spender, uint256 _value) public returns (bool success)
  // function allowance(address _owner, address _spender) public view returns (uint256 remaining)
}

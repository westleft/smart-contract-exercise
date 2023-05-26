// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughtETHEntered();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    address private s_recentWinner;
    
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
      address vefCoordinatorV2, 
      uint256 entranceFee,
      bytes32 gasLane,
      uint64 subscriptionId,
      uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vefCoordinatorV2) {
      i_entranceFee = entranceFee; 
      i_vrfCoordinator = VRFCoordinatorV2Interface(vefCoordinatorV2);
      i_gasLane = gasLane;
      i_subscriptionId = subscriptionId;
      i_callbackGasLimit = callbackGasLimit;
    }

    function enterRaffle() public payable {
      if (msg.value < i_entranceFee) {
        revert Raffle__NotEnoughtETHEntered();
      }

      s_players.push(payable(msg.sender));
      emit RaffleEnter(msg.sender);
    }

    function pickRandomWinner() external {

    }

    function fulfillRandomWords(uint256 /** requestId */, uint256[] memory randomWords) internal override {
      uint256 indexOfWinner = randomWords[0] % s_players.length;
      address payable recentWinner = s_players[indexOfWinner];
      s_recentWinner = recentWinner;
      (bool success, ) = recentWinner.call{value: address(this).balance}("");

      // 匯錢給中獎者，如果失敗
      if (!success) {
        revert Raffle__TransferFailed();
      }

      emit WinnerPicked(recentWinner);
    }

    function requestRandomWinner() external returns (uint256 requestId) {
      // Will revert if subscription is not set and funded.
      requestId = i_vrfCoordinator.requestRandomWords(
          i_gasLane,
          i_subscriptionId,
          REQUEST_CONFIRMATIONS,
          i_callbackGasLimit,
          NUM_WORDS
      );
      emit RequestedRaffleWinner(requestId);
    }

    function getEntranceFee() public view returns(uint256) {
      return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns(address) {
      return s_players[index];
    }

    function getRecentWinner() public view returns(address) {
      return s_recentWinner;
    }
}

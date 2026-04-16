// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract CronixPresale is ReentrancyGuard {

    address public owner;
    address public pendingOwner;

    IERC20 public immutable usdtToken;
    IERC20 public immutable cronixToken;

    address public walletA; // receives 95 % of USDT
    address public walletB; // receives  5 % of USDT

    /// @notice Price of 1 CRONIX in USDT (expressed in USDT's smallest unit).
    /// Default: 0.05 USDT.   USDT on bnb has 18 decimals so → 50_000_000_000_000_000 (5e16).
    /// Owner should set this after deployment once USDT decimals are confirmed.
    uint256 public cronixPriceInUsdt;

    bool public claimAllowed;

    /// @notice Hard cap on total Cronix that can be sold (set once at deploy).
    uint256 public immutable maxSupply;

    uint256 public totalTokensSold;

    // @notice For safty purposes, if something goes wrong can stop buying
    bool public paused;


    mapping(address => uint256) public tokensBought;

    event TokensPurchased(address indexed buyer, uint256 usdtPaid, uint256 cronixAmount);
    event TokensClaimed(address indexed claimer, uint256 cronixAmount);
    event ClaimStatusChanged(bool status);
    event CronixPriceUpdated(uint256 newPriceInUsdt);
    event WalletAUpdated(address indexed newWalletA);
    event WalletBUpdated(address indexed newWalletB);
    event OwnershipTransferStarted(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event UnsoldCronixWithdrawn(address indexed to, uint256 amount);


    modifier notPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Presale: caller is not owner");
        _;
    }

    modifier presaleActive() {
        require(!claimAllowed, "Presale: presale has ended, only claims allowed");
        _;
    }

    /**
     * @param _usdtToken     Address of the USDT (or USDC) token contract.
     * @param _cronixToken   Address of the Cronix token contract.
     * @param _walletA       Primary recipient — receives 95 % of USDT.
     * @param _walletB       Secondary recipient — receives 5 % of USDT.
     * @param _maxSupply     Maximum Cronix tokens available for sale (in wei / 18-dec units).
     * @param _cronixPriceInUsdt  Price per Cronix in USDT's smallest unit.
     *                           
     */
    constructor(
        IERC20 _usdtToken,
        IERC20 _cronixToken,
        address _walletA,
        address _walletB,
        uint256 _maxSupply,
        uint256 _cronixPriceInUsdt
    ) {
        require(address(_usdtToken)   != address(0), "Presale: USDT address is zero");
        require(address(_cronixToken) != address(0), "Presale: Cronix address is zero");
        require(_walletA != address(0),              "Presale: walletA is zero");
        require(_walletB != address(0),              "Presale: walletB is zero");
        require(_maxSupply > 0,                      "Presale: maxSupply must be > 0");
        require(_cronixPriceInUsdt > 0,              "Presale: price must be > 0");

        owner              = msg.sender;
        usdtToken          = _usdtToken;
        cronixToken        = _cronixToken;
        walletA            = _walletA;
        walletB            = _walletB;
        maxSupply          = _maxSupply;
        cronixPriceInUsdt  = _cronixPriceInUsdt;
    }

    receive() external payable { revert("Presale: does not accept native token"); }
    fallback() external payable { revert("Presale: does not accept native token"); }


    /**
     * @notice Purchase Cronix tokens using USDT.
     * @dev    Caller must have approved this contract for at least `usdtAmount`
     *         on the USDT contract before calling.
     * @param  usdtAmount  Amount of USDT (in its smallest unit) to spend.
     */
    function buyTokens(uint256 usdtAmount) external nonReentrant presaleActive notPaused {
        require(usdtAmount > 0, "Presale: usdtAmount must be > 0");

        uint256 cronixDecimals = cronixToken.decimals();
        uint256 cronixAmount   = (usdtAmount * (10 ** cronixDecimals)) / cronixPriceInUsdt;

        require(cronixAmount > 0,                              "Presale: cronixAmount rounds to zero");
        require(cronixToken.balanceOf(address(this)) >= cronixAmount, "Presale: insufficient Cronix in contract");
        require(totalTokensSold + cronixAmount <= maxSupply,   "Presale: exceeds max supply");

        uint256 amountForB = usdtAmount / 20;     
        uint256 amountForA = usdtAmount - amountForB;

        require(
            usdtToken.transferFrom(msg.sender, address(this), usdtAmount),
            "Presale: USDT transfer failed"
        );

        require(
            usdtToken.transfer(walletA, amountForA),
            "Presale: transfer to walletA failed"
        );

        require(
            usdtToken.transfer(walletB, amountForB),
            "Presale: transfer to walletB failed"
        );

        tokensBought[msg.sender] += cronixAmount;
        totalTokensSold          += cronixAmount;

        emit TokensPurchased(msg.sender, usdtAmount, cronixAmount);
    }


    /**
     * @notice Claim all Cronix tokens purchased by the caller.
     * @dev    Owner must call `setClaimStatus(true)` before claims are possible.
     */
    function claimTokens() external nonReentrant {
        require(claimAllowed, "Presale: claiming not yet enabled");

        uint256 amount = tokensBought[msg.sender];
        require(amount > 0, "Presale: nothing to claim");
        tokensBought[msg.sender] = 0;

        require(
            cronixToken.transfer(msg.sender, amount),
            "Presale: Cronix transfer failed"
        );

        emit TokensClaimed(msg.sender, amount);
    }

   

    /**
     * @notice Enable or disable token claiming.
     *         Once enabled, new purchases are blocked (presaleActive modifier).
     */
    function setClaimStatus(bool status) external onlyOwner {
        claimAllowed = status;
        emit ClaimStatusChanged(status);
    }

    /**
     * @notice Update the Cronix price in USDT's smallest unit.
     * @param  newPrice  New price (must be > 0).
     */
    function setCronixPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Presale: price must be > 0");
        cronixPriceInUsdt = newPrice;
        emit CronixPriceUpdated(newPrice);
    }

    /**
     * @notice Update walletA (primary USDT recipient, 95 %).
     */
    function setWalletA(address newWalletA) external onlyOwner {
        require(newWalletA != address(0), "Presale: walletA cannot be zero address");
        walletA = newWalletA;
        emit WalletAUpdated(newWalletA);
    }

    /**
     * @notice Update walletB (secondary USDT recipient, 5 %).
     */
    function setWalletB(address newWalletB) external onlyOwner {
        require(newWalletB != address(0), "Presale: walletB cannot be zero address");
        walletB = newWalletB;
        emit WalletBUpdated(newWalletB);
    }

    /**
     * @notice Withdraw all unsold Cronix tokens back to owner.
     * @dev    Intended for use after the presale ends.
     */
    function withdrawUnsoldCronix() external onlyOwner nonReentrant {
        require(claimAllowed, "Presale: claim not enabled");
        uint256 bal = cronixToken.balanceOf(address(this));
        uint256 unsold = bal > totalTokensSold ? bal - totalTokensSold : 0;
        require(unsold > 0, "Presale: no unsold Cronix to withdraw");
        require(
            cronixToken.transfer(owner, unsold),
            "Presale: Cronix transfer failed"
        );

        emit UnsoldCronixWithdrawn(owner, unsold);
    }

    // owner can pause the buying
    function setPaused(bool _status) external onlyOwner {
        paused = _status;
    }

    
    /**
     * @notice Begin ownership transfer.  `pendingOwner` must call `acceptOwnership`.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Presale: new owner is zero address");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /**
     * @notice Complete ownership transfer.  Must be called by `pendingOwner`.
     */
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Presale: caller is not pending owner");
        address previous = owner;
        owner        = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(previous, owner);
    }


    /// @notice Cronix tokens purchased (and not yet claimed) by `buyer`.
    function tokensBoughtBy(address buyer) external view returns (uint256) {
        return tokensBought[buyer];
    }

    /// @notice Total Cronix tokens sold so far.
    function totalCronixSold() external view returns (uint256) {
        return totalTokensSold;
    }

    /// @notice Cronix tokens still available for purchase.
    function remainingCronixForSale() external view returns (uint256) {
        uint256 bal = cronixToken.balanceOf(address(this));
        if (bal <= totalTokensSold) return 0;
        return bal - totalTokensSold;
    }


    // In case of any failure owner can claim any stuck USDT from the contract
    function recoverUSDT() external onlyOwner {
        uint256 bal = usdtToken.balanceOf(address(this));
        require(bal > 0, "No USDT to recover");

        require(
            usdtToken.transfer(owner, bal),
            "USDT transfer failed"
        );
    }

    /// @notice Returns all key presale stats in one call (useful for front-ends).
    function presaleInfo() external view returns (
        uint256 _maxSupply,
        uint256 _totalSold,
        uint256 _remainingForSale,
        uint256 _priceInUsdt,
        bool    _claimAllowed,
        address _walletA,
        address _walletB
    ) {
        uint256 bal = cronixToken.balanceOf(address(this));
        uint256 rem = bal > totalTokensSold ? bal - totalTokensSold : 0;
        return (
            maxSupply,
            totalTokensSold,
            rem,
            cronixPriceInUsdt,
            claimAllowed,
            walletA,
            walletB
        );
    }
}

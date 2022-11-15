import NeoABI from './abi/neo.json'
import MorpheusABI from './abi/morpheus.json'
import { Interface } from '@ethersproject/abi'
import { BytesLike } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bigNumber'
import { MORPHO_COMPOUND, MORPHO_AAVE } from './constants'

export abstract class Trinity {
  static neo_interface: Interface = new Interface(NeoABI)
  static interface: Interface = new Interface(MorpheusABI)

  ////////////////////////////////////////////////////////////////
  /// --- FLASHLOAN
  ///////////////////////////////////////////////////////////////

  public static executeFlashloan(_tokens: string[], _amounts: BigNumber[], _data: BytesLike): BytesLike {
    return this.neo_interface.encodeFunctionData('executeFlashloan(address[],uint256[],bytes)', [
      _tokens,
      _amounts,
      _data
    ])
  }

  ////////////////////////////////////////////////////////////////
  /// --- MULTICALL
  ///////////////////////////////////////////////////////////////

  public static multicall(_deadline: number, _calls: BytesLike[]): BytesLike {
    const deadline = Math.floor(Date.now() / 1000) + _deadline
    return this.interface.encodeFunctionData('multicall(uint256,bytes[])', [deadline, _calls])
  }

  ////////////////////////////////////////////////////////////////
  /// --- MORPHO SUPPLY/WITHDRAW
  ///////////////////////////////////////////////////////////////

  /// @notice The method to call on the Uniswap V2 Router.
  // function supply(address _market, address _poolToken, address _onBehalf, uint256 _amount)
  public static supply(
    _market: string,
    _poolToken: string,
    _onBehalf: string,
    _amount: BigNumber,
    _maxGasForMatching: BigNumber = BigNumber.from(0)
  ): BytesLike {
    this._validateMarket(_market)

    if (_maxGasForMatching.eq(BigNumber.from(0))) {
      return this.interface.encodeFunctionData('supply(address,address,address,uint256)', [
        _market,
        _poolToken,
        _onBehalf,
        _amount
      ])
    }
    return this.interface.encodeFunctionData('supply(address,address,address,uint256,uint256)', [
      _market,
      _poolToken,
      _onBehalf,
      _amount,
      _maxGasForMatching
    ])
  }

  public static withdraw(_market: string, _poolToken: string, _amount: number): BytesLike {
    this._validateMarket(_market)
    return this.interface.encodeFunctionData('withdraw(address,address,uint256)', [_market, _poolToken, _amount])
  }

  ////////////////////////////////////////////////////////////////
  /// --- MORPHO BORROW/REPAY
  ///////////////////////////////////////////////////////////////

  public static borrow(
    _market: string,
    _poolToken: string,
    _amount: BigNumber,
    _maxGasForMatching: BigNumber = BigNumber.from(0)
  ): BytesLike {
    this._validateMarket(_market)

    if (_maxGasForMatching.eq(BigNumber.from(0))) {
      return this.interface.encodeFunctionData('borrow(address,address,uint256,uint256)', [
        _market,
        _poolToken,
        _amount,
        _maxGasForMatching
      ])
    }
    return this.interface.encodeFunctionData('borrow(address,address,uint256)', [_market, _poolToken, _amount])
  }

  public static repay(_market: string, _poolToken: string, _onBehalf: string, _amount: BigNumber): BytesLike {
    this._validateMarket(_market)

    return this.interface.encodeFunctionData('repay(address,address,address,uint256)', [
      _market,
      _poolToken,
      _onBehalf,
      _amount
    ])
  }

  ////////////////////////////////////////////////////////////////
  /// --- MORPHO CLAIM REWARDS
  ///////////////////////////////////////////////////////////////

  public static claim(_account: string, _claimable: BigNumber, _proof: BytesLike[]): BytesLike {
    return this.interface.encodeFunctionData('claim(address,uint256,bytes32[])', [_account, _claimable, _proof])
  }

  public static claimRewards(_market: string, _poolTokens: string[], _tradeForMorphoToken: boolean): BytesLike {
    return this.interface.encodeFunctionData('claim(address,address[],bool)', [
      _market,
      _poolTokens,
      _tradeForMorphoToken
    ])
  }

  ////////////////////////////////////////////////////////////////
  /// --- TOKENS ACTIONS
  ///////////////////////////////////////////////////////////////

  public static approveToken(_token: string, _to: string, _amount: BigNumber): BytesLike {
    return this.interface.encodeFunctionData('approveToken(address,address,uint256)', [_token, _to, _amount])
  }

  public static transferFrom(_token: string, _from: string, _amount: BigNumber): BytesLike {
    return this.interface.encodeFunctionData('transferFrom(address,address,uint256)', [_token, _from, _amount])
  }

  public static transfer(_token: string, _to: string, _amount: BigNumber): BytesLike {
    return this.interface.encodeFunctionData('transfer(address,address,uint256)', [_token, _to, _amount])
  }

  public static depositWETH(_amount: BigNumber): BytesLike {
    return this.interface.encodeFunctionData('depositWETH(uint256)', [_amount])
  }

  public static withdrawWETH(_amount: BigNumber): BytesLike {
    return this.interface.encodeFunctionData('withdrawWETH(uint256)', [_amount])
  }

  public static balanceInOf(_token: string, _acc: string): BytesLike {
    return this.interface.encodeFunctionData('balanceInOf(address,address)', [_token, _acc])
  }

  ////////////////////////////////////////////////////////////////
  /// --- PARASWAP
  ///////////////////////////////////////////////////////////////

  public static exchange(
    srcToken: string,
    destToken: string,
    underlyingAmount: BigNumber,
    callData: BytesLike
  ): BytesLike {
    return this.interface.encodeFunctionData('exchange(address,address,uint256,bytes)', [
      srcToken,
      destToken,
      underlyingAmount,
      callData
    ])
  }

  private static _validateMarket(_market: string) {
    if (_market !== MORPHO_COMPOUND && _market !== MORPHO_AAVE) throw new Error('INVALID_MARKET')
  }
}
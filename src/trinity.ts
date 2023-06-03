import NeoABI from "./abi/neo.json";
import MorpheusABI from "./abi/morpheus.json";
import TokenActionsModuleABI from "./abi/tokenActionsModule.json";
import AggregatorsModuleABI from "./abi/aggregatorsModule.json";
import MorphoModuleABI from "./abi/morphoModule.json";
import { Address, Hex, encodeAbiParameters, parseAbiParameters } from "viem";
import { Interface } from "@ethersproject/abi";
import { BytesLike } from "@ethersproject/bytes";
import { BigNumber } from "@ethersproject/bignumber";
import {
	MORPHO_COMPOUND,
	MORPHO_AAVE,
	MORPHO_AAVE_V3,
	ZERO_EX_ROUTER,
	INCH_ROUTER,
	MORPHO_MODULE_ID,
	TOKEN_ACTIONS_MODULE_ID,
	AGGREGATOR_MODULE_ID,
} from "./constants";

// TODO : Split Trinity in multiple classes (modules)
export abstract class Trinity {
	static neo_interface: Interface = new Interface(NeoABI);
	static interface: Interface = new Interface(MorpheusABI);
	static token_module_interface: Interface = new Interface(
		TokenActionsModuleABI,
	);
	static morpho_module_interface: Interface = new Interface(MorphoModuleABI);
	static aggregators_module_interface: Interface = new Interface(
		AggregatorsModuleABI,
	);

	////////////////////////////////////////////////////////////////
	/// --- FLASHLOAN
	///////////////////////////////////////////////////////////////

	public static executeFlashloan(
		_tokens: string[],
		_amounts: BigNumber[],
		_data: BytesLike,
		_isAave: boolean,
	): BytesLike {
		return this.neo_interface.encodeFunctionData(
			"executeFlashloan(address[],uint256[],bytes,bool)",
			[_tokens, _amounts, _data, _isAave],
		);
	}

	public static executeFlashloanWithReceiver(
		_tokensReceiver: string[],
		_tokens: string[],
		_amounts: BigNumber[],
		_data: BytesLike,
		_receiver: string,
		_isAave: boolean,
	): BytesLike {
		return this.neo_interface.encodeFunctionData(
			"executeFlashloanWithReceiver(address[],address[],uint256[],bytes,address,bool)",
			[_tokensReceiver, _tokens, _amounts, _data, _receiver, _isAave],
		);
	}

	/// @notice Build the calldata for a multicall, to be called by the flashloan
	public static multicallFlashloan(
		_proxy: string,
		_deadline: number,
		_calls: BytesLike[],
		_argPos: number[],
	): BytesLike {
		const deadline = Math.floor(Date.now() / 1000) + _deadline;
		return this.interface._abiCoder.encode(
			["address", "uint256", "bytes[]", "uint256[]"],
			[_proxy, deadline, _calls, _argPos],
		);
	}

	////////////////////////////////////////////////////////////////
	/// --- MULTICALL
	///////////////////////////////////////////////////////////////

	public static multicall(
		_deadline: number,
		_calls: BytesLike[],
		_argPos: number[],
	): BytesLike {
		const deadline = Math.floor(Date.now() / 1000) + _deadline;
		return this.interface.encodeFunctionData(
			"multicall(uint256,bytes[],uint256[])",
			[deadline, _calls, _argPos],
		);
	}

	public static multicallWithReceiver(
		_tokens: string[],
		_deadline: number,
		_calls: BytesLike[],
		_argPos: number[],
		_receiver: string,
	): BytesLike {
		const _data = this.multicall(_deadline, _calls, _argPos);
		return this.neo_interface.encodeFunctionData(
			"executeWithReceiver(address[],bytes,address)",
			[_tokens, _data, _receiver],
		);
	}

	////////////////////////////////////////////////////////////////
	/// --- MORPHO SUPPLY/WITHDRAW
	///////////////////////////////////////////////////////////////

	// function supply(address _market, address _poolToken, address _onBehalf, uint256 _amount)
	// function supply(address _market, address _poolToken, address _onBehalf, uint256 _amount, uint256 _maxGasForMatching)
	public static supply(
		_market: string,
		_poolToken: string,
		_onBehalf: string,
		_amount: BigNumber,
		_maxGasForMatching: BigNumber = BigNumber.from(0),
	): BytesLike {
		this._validateMarket(_market);

		let _calldata: string;
		let _functionCalldata: any;

		if (_maxGasForMatching.eq(BigNumber.from(0))) {
			_functionCalldata = this.morpho_module_interface.encodeFunctionData(
				"supply(address,address,address,uint256)",
				[_market, _poolToken, _onBehalf, _amount],
			);
		} else {
			_functionCalldata = this.morpho_module_interface.encodeFunctionData(
				"supply(address,address,address,uint256,uint256)",
				[_market, _poolToken, _onBehalf, _amount, _maxGasForMatching],
			);
		}

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// function supply(address underlying, uint256 amount, address onBehalf, uint256 maxIterations)
	public static supplyAaveV3(
		_underlying: string,
		_amount: BigNumber,
		_onBehalf: string,
		_maxIterations: BigNumber,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"supply(address,uint256,address,uint256)",
			[_underlying, _amount, _onBehalf, _maxIterations],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// function supplyCollateral(address underlying, uint256 amount, address onBehalf)
	public static supplyCollateralAaveV3(
		_underlying: string,
		_amount: BigNumber,
		_onBehalf: string,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"supplyCollateral(address,uint256,address)",
			[_underlying, _amount, _onBehalf],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// function withdraw(address _market, address _poolToken, uint256 _amount)
	public static withdraw(
		_market: string,
		_poolToken: string,
		_amount: BigNumber,
	): BytesLike {
		this._validateMarket(_market);

		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"withdraw(address,address,uint256)",
			[_market, _poolToken, _amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// function withdraw(address underlying, uint256 amount, address onBehalf, address receiver, uint256 maxIterations)
	public static withdrawAaveV3(
		_underlying: string,
		_amount: BigNumber,
		_onBehalf: string,
		_receiver: string,
		_maxIterations: BigNumber,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"withdraw(address,uint256,address,address,uint256)",
			[_underlying, _amount, _onBehalf, _receiver, _maxIterations],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// function withdrawCollateral(address underlying, uint256 amount, address onBehalf, address receiver)
	public static withdrawCollateralAaveV3(
		_underlying: string,
		_amount: BigNumber,
		_onBehalf: string,
		_receiver: string,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"withdrawCollateral(address,uint256,address,address)",
			[_underlying, _amount, _onBehalf, _receiver],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	////////////////////////////////////////////////////////////////
	/// --- MORPHO BORROW/REPAY
	///////////////////////////////////////////////////////////////

	// function borrow(address _market, address _poolToken, uint256 _amount)
	// function borrow(address _market, address _poolToken, uint256 _amount, uint256 _maxGasForMatching)
	public static borrow(
		_market: string,
		_poolToken: string,
		_amount: BigNumber,
		_maxGasForMatching: BigNumber = BigNumber.from(0),
	): BytesLike {
		this._validateMarket(_market);

		let _calldata: string;
		let _functionCalldata: any;

		if (_maxGasForMatching.eq(BigNumber.from(0))) {
			_functionCalldata = this.morpho_module_interface.encodeFunctionData(
				"borrow(address,address,uint256)",
				[_market, _poolToken, _amount],
			);
		} else {
			_functionCalldata = this.morpho_module_interface.encodeFunctionData(
				"borrow(address,address,uint256,uint256)",
				[_market, _poolToken, _amount, _maxGasForMatching],
			);
		}

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// function borrow(address underlying, uint256 amount, address onBehalf, address receiver, uint256 maxIterations)
	public static borrowAaveV3(
		_underlying: string,
		_amount: BigNumber,
		_onBehalf: string,
		_receiver: string,
		_maxIterations: BigNumber,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"borrow(address,uint256,address,address,uint256)",
			[_underlying, _amount, _onBehalf, _receiver, _maxIterations],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static repay(
		_market: string,
		_poolToken: string,
		_onBehalf: string,
		_amount: BigNumber,
	): BytesLike {
		this._validateMarket(_market);

		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"repay(address,address,address,uint256)",
			[_market, _poolToken, _onBehalf, _amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	// repay(address underlying, uint256 amount, address onBehalf)
	public static repayAaveV3(
		_underlying: Address,
		_amount: BigNumber,
		_onBehalf: Address,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"repay(address,uint256,address)",
			[_underlying, _amount, _onBehalf],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	////////////////////////////////////////////////////////////////
	/// --- MORPHO CLAIM REWARDS
	///////////////////////////////////////////////////////////////

	public static claim(
		_account: string,
		_claimable: BigNumber,
		_proof: Hex[],
	): string {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"claim(address,uint256,bytes32[])",
			[_account, _claimable, _proof],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static claimRewards(
		_market: string,
		_poolTokens: string[],
		_tradeForMorphoToken: boolean,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"claim(address,address[],bool)",
			[_market, _poolTokens, _tradeForMorphoToken],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	//claim(address[] calldata assets, address onBehalf) // AAVE_V3
	public static claimRewardsAaveV3(
		_assets: Address[],
		_onBehalf: Address,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.morpho_module_interface.encodeFunctionData(
			"claim(address[],address)",
			[_assets, _onBehalf],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			MORPHO_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	////////////////////////////////////////////////////////////////
	/// --- TOKENS ACTIONS
	///////////////////////////////////////////////////////////////

	public static approveToken(
		_token: string,
		_to: string,
		_amount: BigNumber,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"approveToken(address,address,uint256)",
			[_token, _to, _amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static transferFrom(
		_token: string,
		_from: string,
		_amount: BigNumber,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"transferFrom(address,address,uint256)",
			[_token, _from, _amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static transfer(
		_token: string,
		_to: string,
		_amount: BigNumber,
	): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"transfer(address,address,uint256)",
			[_token, _to, _amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static depositSTETH(_amount: BigNumber): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"depositSTETH(uint256)",
			[_amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static depositWETH(_amount: BigNumber): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"depositWETH(uint256)",
			[_amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static withdrawWETH(_amount: BigNumber): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"withdrawWETH(uint256)",
			[_amount],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	public static balanceInOf(_token: string, _acc: string): BytesLike {
		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.token_module_interface.encodeFunctionData(
			"balanceInOf(address,address)",
			[_token, _acc],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			TOKEN_ACTIONS_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	////////////////////////////////////////////////////////////////
	/// --- AGGREGATOR
	///////////////////////////////////////////////////////////////

	public static exchange(
		aggregator: string,
		srcToken: string,
		destToken: string,
		underlyingAmount: BigNumber,
		callData: BytesLike,
	): BytesLike {
		this._validateAggregator(aggregator);

		let _calldata: string;
		let _functionCalldata: any;

		_functionCalldata = this.aggregators_module_interface.encodeFunctionData(
			"exchange(address,address,address,uint256,bytes)",
			[aggregator, srcToken, destToken, underlyingAmount, callData],
		);

		_calldata = encodeAbiParameters(parseAbiParameters("bytes1, bytes"), [
			AGGREGATOR_MODULE_ID,
			_functionCalldata,
		]);

		return _calldata;
	}

	private static _validateMarket(_market: string) {
		if (
			_market !== MORPHO_COMPOUND &&
			_market !== MORPHO_AAVE &&
			_market !== MORPHO_AAVE_V3
		)
			throw new Error("INVALID_MARKET");
	}

	private static _validateAggregator(_aggregator: string) {
		if (_aggregator !== ZERO_EX_ROUTER && _aggregator !== INCH_ROUTER)
			throw new Error("INVALID_AGGREGATOR");
	}
}

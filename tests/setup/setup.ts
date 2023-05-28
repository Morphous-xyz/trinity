import { FORK_BLOCK_NUMBER, FORK_URL } from "./global-setup";
import { fetchLogs } from "@viem/anvil";
import { POOL_ID } from "utils/constants";
import { afterAll, afterEach, beforeAll } from "vitest";
import { testClient, walletClient } from "../helpers/globals";
import { MORPHEUS, NEO, FLASHLOAN } from "../../src/constants";

beforeAll(async () => {	
	// Initialize new bytecodes for contracts
	await testClient.setCode({
		address: MORPHEUS,
		bytecode: '0x6080604052600436106100595760003560e01c806354fd4d5014610065578063854bb528146100a25780638da5cb5b146100da578063f02a1d79146100fa578063f13015d61461011c578063f2fde38b1461013c57600080fd5b3661006057005b600080fd5b34801561007157600080fd5b5060408051808201825260058152640322e302e360dc1b602082015290516100999190610623565b60405180910390f35b3480156100ae57600080fd5b506100c26100bd36600461065a565b61015c565b6040516001600160a01b039091168152602001610099565b3480156100e657600080fd5b506001546100c2906001600160a01b031681565b34801561010657600080fd5b5061011a61011536600461068d565b610186565b005b61012f61012a366004610710565b6101e2565b604051610099919061078a565b34801561014857600080fd5b5061011a6101573660046107ce565b6104e6565b6001600160f81b031981166000908152602081905260408120546001600160a01b03165b92915050565b6001546001600160a01b031633146101d45760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064015b60405180910390fd5b6101de828261057b565b5050565b606085804211156102065760405163ab880e8960e01b815260040160405180910390fd5b848314610226576040516376b3b52560e11b815260040160405180910390fd5b8467ffffffffffffffff81111561023f5761023f6107eb565b604051908082528060200260200182016040528015610268578160200160208202803683370190505b509150600085815b818110156104d9576000808a8a8481811061028d5761028d610801565b905060200281019061029f9190610817565b8101906102ac919061085e565b6040516310a976a560e31b81526001600160f81b03198316600482015291935091506000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063854bb52890602401602060405180830381865afa158015610322573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103469190610920565b905089898581811061035a5761035a610801565b9050602002013595506000841180156103735750600086115b1561044457858260008a61038860018961093d565b8151811061039857610398610801565b602002602001015160001c90508060208401830152306001600160a01b0316631cff79cd85846040518363ffffffff1660e01b81526004016103db92919061095e565b6020604051808303816000875af11580156103fa573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061041e919061098a565b8b888151811061043057610430610801565b6020026020010181815250505050506104cb565b604051631cff79cd60e01b81523090631cff79cd90610469908490869060040161095e565b6020604051808303816000875af1158015610488573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ac919061098a565b8885815181106104be576104be610801565b6020026020010181815250505b836001019350505050610270565b5050505095945050505050565b6001546001600160a01b0316331461052f5760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064016101cb565b600180546001600160a01b0319166001600160a01b03831690811790915560405133907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a350565b6001600160f81b0319821660008181526020819052604080822080546001600160a01b0319166001600160a01b03861690811790915590519092917f60311937feac13d6d2aa03fa285459b46e90fe2ff777aeb3eb191ae10542298391a35050565b6000815180845260005b81811015610603576020818501810151868301820152016105e7565b506000602082860101526020601f19601f83011685010191505092915050565b60208152600061063660208301846105dd565b9392505050565b80356001600160f81b03198116811461065557600080fd5b919050565b60006020828403121561066c57600080fd5b6106368261063d565b6001600160a01b038116811461068a57600080fd5b50565b600080604083850312156106a057600080fd5b6106a98361063d565b915060208301356106b981610675565b809150509250929050565b60008083601f8401126106d657600080fd5b50813567ffffffffffffffff8111156106ee57600080fd5b6020830191508360208260051b850101111561070957600080fd5b9250929050565b60008060008060006060868803121561072857600080fd5b85359450602086013567ffffffffffffffff8082111561074757600080fd5b61075389838a016106c4565b9096509450604088013591508082111561076c57600080fd5b50610779888289016106c4565b969995985093965092949392505050565b6020808252825182820181905260009190848201906040850190845b818110156107c2578351835292840192918401916001016107a6565b50909695505050505050565b6000602082840312156107e057600080fd5b813561063681610675565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b6000808335601e1984360301811261082e57600080fd5b83018035915067ffffffffffffffff82111561084957600080fd5b60200191503681900382131561070957600080fd5b6000806040838503121561087157600080fd5b61087a8361063d565b9150602083013567ffffffffffffffff8082111561089757600080fd5b818501915085601f8301126108ab57600080fd5b8135818111156108bd576108bd6107eb565b604051601f8201601f19908116603f011681019083821181831017156108e5576108e56107eb565b816040528281528860208487010111156108fe57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b60006020828403121561093257600080fd5b815161063681610675565b8181038181111561018057634e487b7160e01b600052601160045260246000fd5b6001600160a01b0383168152604060208201819052600090610982908301846105dd565b949350505050565b60006020828403121561099c57600080fd5b505191905056fea2646970667358221220c9cb0e0500c06a084c305fd686a29995feb87c283a05af63b7fb64df5492f56764736f6c63430008140033'
	})

	await testClient.setCode({
		address: NEO,
		bytecode: '0x6080604052600436106100225760003560e01c806363a23f701461002e57600080fd5b3661002957005b600080fd5b61004161003c3660046104ea565b610043565b005b61006e7f0000000000000000000000000000000000000000000000000000000000000000600161012c565b6040516377e2c58560e01b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906377e2c585906100c6908a908a908a908a908a908a908a90600401610600565b600060405180830381600087803b1580156100e057600080fd5b505af11580156100f4573d6000803e3d6000fd5b505050506101237f0000000000000000000000000000000000000000000000000000000000000000600061012c565b50505050505050565b6000306001600160a01b031663bf7e214f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561016c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061019091906106a8565b9050806001600160a01b03811661027657735a15566417e6c1c9546523066500bddbc53f88c76001600160a01b03166365688cc96040518163ffffffff1660e01b81526004016020604051808303816000875af11580156101f5573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061021991906106a8565b604051637a9e5e4b60e01b81526001600160a01b03821660048201529091503090637a9e5e4b90602401600060405180830381600087803b15801561025d57600080fd5b505af1158015610271573d6000803e3d6000fd5b505050505b8280156102ff575060405163b700961360e01b81526001600160a01b0382169063b7009613906102bc9087903090600080516020610717833981519152906004016106cc565b602060405180830381865afa1580156102d9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102fd91906106f9565b155b15610379576040516332fba9a360e21b81526001600160a01b0382169063cbeea68c906103429087903090600080516020610717833981519152906004016106cc565b600060405180830381600087803b15801561035c57600080fd5b505af1158015610370573d6000803e3d6000fd5b50505050610477565b82158015610401575060405163b700961360e01b81526001600160a01b0382169063b7009613906103c09087903090600080516020610717833981519152906004016106cc565b602060405180830381865afa1580156103dd573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061040191906106f9565b1561047757604051632bc3217d60e01b81526001600160a01b03821690632bc3217d906104449087903090600080516020610717833981519152906004016106cc565b600060405180830381600087803b15801561045e57600080fd5b505af1158015610472573d6000803e3d6000fd5b505050505b50505050565b60008083601f84011261048f57600080fd5b50813567ffffffffffffffff8111156104a757600080fd5b6020830191508360208260051b85010111156104c257600080fd5b9250929050565b80151581146104d757600080fd5b50565b80356104e5816104c9565b919050565b60008060008060008060006080888a03121561050557600080fd5b873567ffffffffffffffff8082111561051d57600080fd5b6105298b838c0161047d565b909950975060208a013591508082111561054257600080fd5b61054e8b838c0161047d565b909750955060408a013591508082111561056757600080fd5b818a0191508a601f83011261057b57600080fd5b81358181111561058a57600080fd5b8b602082850101111561059c57600080fd5b6020830195508094505050506105b4606089016104da565b905092959891949750929550565b6001600160a01b03811681146104d757600080fd5b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6080808252810187905260008860a08301825b8a811015610643578235610626816105c2565b6001600160a01b0316825260209283019290910190600101610613565b5083810360208501528781526001600160fb1b0388111561066357600080fd5b8760051b915081896020830137018281036020908101604085015261068b90820186886105d7565b91505061069c606083018415159052565b98975050505050505050565b6000602082840312156106ba57600080fd5b81516106c5816105c2565b9392505050565b6001600160a01b0393841681529190921660208201526001600160e01b0319909116604082015260600190565b60006020828403121561070b57600080fd5b81516106c5816104c956fe1cff79cde515a86f6cc1adbebe8ae25888905561371faf11c8102211f56b4870a264697066735822122010c8396455fd0c3d09a45972e11882e38f679675222aa9676b1ec96100229a5d64736f6c63430008140033'
	})

	await testClient.setCode({
		address: FLASHLOAN,
		bytecode: '0x608060405234801561001057600080fd5b506004361061004c5760003560e01c806376cacd201461005157806377e2c58514610095578063920f5c84146100aa578063f04f2707146100cd575b600080fd5b6100787f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b6100a86100a3366004610beb565b6100e0565b005b6100bd6100b8366004610d31565b610226565b604051901515815260200161008c565b6100a86100db366004610df3565b6104ca565b80156101ad576000855167ffffffffffffffff81111561010257610102610a84565b60405190808252806020026020018201604052801561012b578160200160208202803683370190505b5060405163ab9c4b5d60e01b8152909150737d2768de32b0b80b7a3454c06bdac94a69ddc7a99063ab9c4b5d906101759030908a908a90879084908c908c90600090600401610f3d565b600060405180830381600087803b15801561018f57600080fd5b505af11580156101a3573d6000803e3d6000fd5b505050505061021f565b604051632e1c224f60e11b815273ba12222222228d8ba445958a75a0704d566bf2c890635c38449e906101ec9030908990899089908990600401610fbd565b600060405180830381600087803b15801561020657600080fd5b505af115801561021a573d6000803e3d6000fd5b505050505b5050505050565b6000805460011461026b5760405162461bcd60e51b815260206004820152600a6024820152695245454e5452414e435960b01b60448201526064015b60405180910390fd5b60026000556001600160a01b038316301461029957604051638178b62360e01b815260040160405180910390fd5b33737d2768de32b0b80b7a3454c06bdac94a69ddc7a9146102cd5760405163abc2bcad60e01b815260040160405180910390fd5b600080600080858060200190518101906102e79190611093565b935093509350935060005b8a5181101561034b576103388b8281518110610310576103106111b7565b6020026020010151868c848151811061032b5761032b6111b7565b602002602001015161072c565b5080610343816111e3565b9150506102f2565b50836001600160a01b0316631cff79cd477f000000000000000000000000000000000000000000000000000000000000000086868660405160240161039293929190611228565b60408051601f198184030181529181526020820180516001600160e01b03166378980aeb60e11b1790525160e085901b6001600160e01b03191681526103dc9291906004016112a5565b60206040518083038185885af11580156103fa573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061041f91906112d1565b5060005b8a518110156104b3576104a18b8281518110610441576104416111b7565b6020026020010151737d2768de32b0b80b7a3454c06bdac94a69ddc7a98b8481518110610470576104706111b7565b60200260200101518d858151811061048a5761048a6111b7565b602002602001015161049c91906112ea565b6107ce565b806104ab816111e3565b915050610423565b506001945050505050600160005595945050505050565b6000546001146105095760405162461bcd60e51b815260206004820152600a6024820152695245454e5452414e435960b01b6044820152606401610262565b60026000553373ba12222222228d8ba445958a75a0704d566bf2c8146105425760405163abc2bcad60e01b815260040160405180910390fd5b6000806000808480602001905181019061055c9190611093565b935093509350935060005b88518110156105b3576105a0898281518110610585576105856111b7565b6020026020010151868a848151811061032b5761032b6111b7565b50806105ab816111e3565b915050610567565b50836001600160a01b0316631cff79cd477f00000000000000000000000000000000000000000000000000000000000000008686866040516024016105fa93929190611228565b60408051601f198184030181529181526020820180516001600160e01b03166378980aeb60e11b1790525160e085901b6001600160e01b03191681526106449291906004016112a5565b60206040518083038185885af1158015610662573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061068791906112d1565b5060005b885181101561071c576107098982815181106106a9576106a96111b7565b602002602001015173ba12222222228d8ba445958a75a0704d566bf2c88984815181106106d8576106d86111b7565b60200260200101518b85815181106106f2576106f26111b7565b602002602001015161070491906112ea565b61072c565b5080610714816111e3565b91505061068b565b5050600160005550505050505050565b60006000198203610744576107418430610893565b91505b6001600160a01b0383161580159061076557506001600160a01b0383163014155b801561077057508115155b156107c3576001600160a01b03841673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee146107b2576107ad6001600160a01b038516848461093e565b6107bc565b6107bc83836109bc565b50806107c7565b5060005b9392505050565b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038416016107f857505050565b604051636eb1769f60e11b81523060048201526001600160a01b03838116602483015282919085169063dd62ed3e90604401602060405180830381865afa158015610847573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061086b91906112d1565b1080610875575080155b1561088e5761088e6001600160a01b0384168383610a0d565b505050565b600073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038416016108cb57506001600160a01b03811631610938565b6040516370a0823160e01b81526001600160a01b0383811660048301528416906370a0823190602401602060405180830381865afa158015610911573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061093591906112d1565b90505b92915050565b600060405163a9059cbb60e01b8152836004820152826024820152602060006044836000895af13d15601f3d11600160005114161716915050806109b65760405162461bcd60e51b815260206004820152600f60248201526e1514905394d1915497d19052531151608a1b6044820152606401610262565b50505050565b600080600080600085875af190508061088e5760405162461bcd60e51b815260206004820152601360248201527211551217d514905394d1915497d19052531151606a1b6044820152606401610262565b600060405163095ea7b360e01b8152836004820152826024820152602060006044836000895af13d15601f3d11600160005114161716915050806109b65760405162461bcd60e51b815260206004820152600e60248201526d1054141493d59157d1905253115160921b6044820152606401610262565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715610ac357610ac3610a84565b604052919050565b600067ffffffffffffffff821115610ae557610ae5610a84565b5060051b60200190565b6001600160a01b0381168114610b0457600080fd5b50565b600082601f830112610b1857600080fd5b81356020610b2d610b2883610acb565b610a9a565b82815260059290921b84018101918181019086841115610b4c57600080fd5b8286015b84811015610b70578035610b6381610aef565b8352918301918301610b50565b509695505050505050565b600082601f830112610b8c57600080fd5b81356020610b9c610b2883610acb565b82815260059290921b84018101918181019086841115610bbb57600080fd5b8286015b84811015610b705780358352918301918301610bbf565b80358015158114610be657600080fd5b919050565b600080600080600060808688031215610c0357600080fd5b853567ffffffffffffffff80821115610c1b57600080fd5b610c2789838a01610b07565b96506020880135915080821115610c3d57600080fd5b610c4989838a01610b7b565b95506040880135915080821115610c5f57600080fd5b818801915088601f830112610c7357600080fd5b813581811115610c8257600080fd5b896020828501011115610c9457600080fd5b602083019550809450505050610cac60608701610bd6565b90509295509295909350565b600067ffffffffffffffff821115610cd257610cd2610a84565b50601f01601f191660200190565b600082601f830112610cf157600080fd5b8135610cff610b2882610cb8565b818152846020838601011115610d1457600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600060a08688031215610d4957600080fd5b853567ffffffffffffffff80821115610d6157600080fd5b610d6d89838a01610b07565b96506020880135915080821115610d8357600080fd5b610d8f89838a01610b7b565b95506040880135915080821115610da557600080fd5b610db189838a01610b7b565b945060608801359150610dc382610aef565b90925060808701359080821115610dd957600080fd5b50610de688828901610ce0565b9150509295509295909350565b60008060008060808587031215610e0957600080fd5b843567ffffffffffffffff80821115610e2157600080fd5b610e2d88838901610b07565b95506020870135915080821115610e4357600080fd5b610e4f88838901610b7b565b94506040870135915080821115610e6557600080fd5b610e7188838901610b7b565b93506060870135915080821115610e8757600080fd5b50610e9487828801610ce0565b91505092959194509250565b600081518084526020808501945080840160005b83811015610ed95781516001600160a01b031687529582019590820190600101610eb4565b509495945050505050565b600081518084526020808501945080840160005b83811015610ed957815187529582019590820190600101610ef8565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b600060018060a01b03808b16835260e06020840152610f5f60e084018b610ea0565b8381036040850152610f71818b610ee4565b90508381036060850152610f85818a610ee4565b9050818816608085015283810360a0850152610fa2818789610f14565b9250505061ffff831660c08301529998505050505050505050565b6001600160a01b0386168152608060208201819052600090610fe190830187610ea0565b8281036040840152610ff38187610ee4565b90508281036060840152611008818587610f14565b98975050505050505050565b60005b8381101561102f578181015183820152602001611017565b50506000910152565b600082601f83011261104957600080fd5b81516020611059610b2883610acb565b82815260059290921b8401810191818101908684111561107857600080fd5b8286015b84811015610b70578051835291830191830161107c565b600080600080608085870312156110a957600080fd5b84516110b481610aef565b809450506020808601519350604086015167ffffffffffffffff808211156110db57600080fd5b818801915088601f8301126110ef57600080fd5b81516110fd610b2882610acb565b81815260059190911b8301840190848101908b83111561111c57600080fd5b8585015b8381101561118f578051858111156111385760008081fd5b8601603f81018e1361114a5760008081fd5b8781015161115a610b2882610cb8565b8181528f60408385010111156111705760008081fd5b611180828b830160408601611014565b85525050918601918601611120565b5060608b015190975094505050808311156111a957600080fd5b5050610e9487828801611038565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016111f5576111f56111cd565b5060010190565b60008151808452611214816020860160208601611014565b601f01601f19169290920160200192915050565b600060608201858352602060608185015281865180845260808601915060808160051b870101935082880160005b8281101561128457607f198887030184526112728683516111fc565b95509284019290840190600101611256565b5050505050828103604084015261129b8185610ee4565b9695505050505050565b6001600160a01b03831681526040602082018190526000906112c9908301846111fc565b949350505050565b6000602082840312156112e357600080fd5b5051919050565b80820180821115610938576109386111cd56fea2646970667358221220995f27acdc13eefd1721cb762d1150c36d54910eddfd9e519c3c3db1cee2fb2664736f6c63430008140033'
	})
});
afterAll(async () => {
	await testClient.reset({
		blockNumber: FORK_BLOCK_NUMBER,
		jsonRpcUrl: FORK_URL,
	});
});

afterEach((context) => {
	// Print the last log entries from anvil after each test.
	context.onTestFailed(async (result) => {
		try {
			const response = await fetchLogs("http://127.0.0.1:8545", POOL_ID);
			const logs = response.slice(-20);

			if (logs.length === 0) {
				return;
			}

			// Try to append the log messages to the vitest error message if possible. Otherwise, print them to the console.
			const error = result.errors?.[0];

			if (error !== undefined) {
				error.message +=
					"\n\nAnvil log output\n=======================================\n";
				error.message += `\n${logs.join("\n")}`;
			} else {
				// rome-ignore lint/nursery/noConsoleLog: this is fine ...
				console.log(...logs);
			}
		} catch { }
	});
});

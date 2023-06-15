include .env

default:; forge fmt && forge test

.EXPORT_ALL_VARIABLES:
FOUNDRY_ETH_RPC_URL=$(RPC_URL_MAINNET)

test:; yarn test && forge test
build:; yarn lint:fix && yarn build
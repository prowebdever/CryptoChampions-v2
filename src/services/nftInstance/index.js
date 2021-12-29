
import { Contract } from '@ethersproject/contracts'

import { nftABI } from '../../abis/nfttoken';
import { nftContractAddress } from '../../constants/contractAddresses';

const nftInstance = (account, chainId, library) => {

    if (chainId) {
        return new Contract(nftContractAddress, nftABI, library.getSigner(account));
    }
    return null
}

export {
    nftInstance
}

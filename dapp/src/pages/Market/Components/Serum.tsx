import * as React from 'react';
import {
  refreshAccount,
  transactionServices,
  useGetAccountInfo,
  useGetNetworkConfig,
  useGetPendingTransactions
} from '@elrondnetwork/dapp-core';
import {
  deadTokenId,
  elrondApiUrl,
  elrondExplorerUrl,
  serumMarketAddress,
  serumMarketBuyFn,
  serumMarketCollectionId,
  serumMarketPrice,
  serumMarketTokenId,
  serumOwnerAddress,
  serumWithdrawData,
  voteAddress,
  voteFinishData,
  voteNoData,
  voteOwnerAddress,
  voteWithdrawData,
  voteYesData
} from 'config';
import axios from 'axios';

import {
  faCircleQuestion,
  faPersonBooth,
  faCheckCircle,
  faXmarkCircle,
  faCircleStop,
  faShop,
  faMoneyBillTransfer
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactComponent as DeadIcon } from '../../../assets/img/dead.svg';
import { divide, floor } from 'mathjs';
import {
  Address,
  AddressValue,
  ContractFunction,
  ProxyProvider,
  Query
} from '@elrondnetwork/erdjs';
import { ProgressBar } from 'react-bootstrap';
import { orderBy } from 'lodash-es';
import LazyLoad from 'react-lazyload';

interface Serum {
  identifier: string;
  url: string;
  name: string;
  metadata: any;
  collection: string;
  nonce: number;
}

const Serum = () => {
  const account = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const { address } = account;

  const [question, setQuestion] = React.useState<string>();
  const [inProgress, setInProgress] = React.useState<number>();
  const [yes, setYes] = React.useState<number>();
  const [no, setNo] = React.useState<number>();

  const /*transactionSessionId*/ [, setTransactionSessionId] = React.useState<
      string | null
    >(null);

  const [serums, setSerumsList] = React.useState<Serum[]>();

  React.useEffect(() => {
    // Use [] as second argument in useEffect for not rendering each time
    axios
      .get<any>(
        `${elrondApiUrl}/accounts/${serumMarketAddress}/nfts?size=10000&collections=${serumMarketCollectionId}`
      )
      .then((response) => {
        setSerumsList(
          orderBy(response.data, ['collection', 'nonce'], ['desc', 'asc'])
        );
      });
  }, [hasPendingTransactions]);

  const { sendTransactions } = transactionServices;

  function strtoHex(str: string) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    if (result.length % 2 == 1) {
      result = '0' + result;
    }
    return result;
  }

  function numtoHex(num: number) {
    let result = num.toString(16);
    if (result.length % 2 == 1) {
      result = '0' + result;
    }
    return result;
  }

  const getBuySerumData = (serum: Serum) => {
    return (
      'ESDTTransfer@' +
      strtoHex(serumMarketTokenId) +
      '@' +
      // numtoHex(serumMarketPrice * 10 ** 18) +
      numtoHex(serumMarketPrice) +
      '@' +
      strtoHex(serumMarketBuyFn) +
      '@' +
      strtoHex(serum.collection) +
      '@' +
      numtoHex(serum.nonce)
    );
  };

  const sendBuySerumTransaction = async (serum: Serum) => {
    const yesTransaction = {
      value: '0',
      data: getBuySerumData(serum),
      receiver: serumMarketAddress,
      gasLimit: '5000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: yesTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing yes vote transaction',
        errorMessage: 'An error has occured during yes vote',
        successMessage: 'Yes vote transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendWithdrawTransaction = async () => {
    const withdrawTransaction = {
      value: '0',
      data: serumWithdrawData,
      receiver: serumMarketAddress,
      gasLimit: '5000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: withdrawTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing yes vote transaction',
        errorMessage: 'An error has occured during yes vote',
        successMessage: 'Yes vote transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const getAttributes = (serum: Serum): Array<string> => {
    return serum.metadata?.attributes?.map(
      (x: any) => `${x.trait_type} ${x.value}`
    );
  };

  const getAttributesDiv = (serum: Serum) => {
    const attributes = getAttributes(serum);
    return !!attributes ? (
      attributes?.map((attribute) => <span key={attribute}>{attribute}</span>)
    ) : (
      <span>Attributes not found</span>
    );
  };

  return (
    <div>
      <h3>
        Buy Serum <FontAwesomeIcon icon={faShop} className='text' />
      </h3>
      <div className='row'>
        {serums === undefined && (
          <div className='col'>
            <div className='spinner-border text-primary mr-2' role='status'>
              <span className='sr-only'>Loading...</span>
            </div>
          </div>
        )}
        {serums !== undefined && serums.length === 0 && (
          <div className='col'>
            <div>No Serums found in the market !</div>
          </div>
        )}
        {address !== undefined &&
          address === serumOwnerAddress &&
          !hasPendingTransactions && (
            <div className='mt-2 col-12'>
              <button
                onClick={sendWithdrawTransaction}
                className='btn btn-primary mr-4'
              >
                WITHDRAW&nbsp;
                <FontAwesomeIcon icon={faMoneyBillTransfer} />
              </button>
            </div>
          )}
        {serums !== undefined &&
          serums.length > 0 &&
          serums.map((serum) => (
            <div
              key={serum.identifier}
              className='col-12 col-sm-12 col-md-6 col-lg-4 mt-4 mx-auto'
            >
              <LazyLoad height={200} offset={100} once>
                <div>
                  <b>{serum.name}</b>
                </div>
                <div>
                  Rarity&nbsp;
                  {!!serum.metadata?.rarity?.rarityScore
                    ? floor(serum.metadata?.rarity?.rarityScore)
                    : 'unknown'}
                </div>
                <div className='nft serum'>
                  <div className='back'>
                    <h4>Attributes:</h4>
                    {getAttributesDiv(serum)}
                  </div>
                  <div className='front'>
                    <img
                      src={serum.url}
                      alt={serum.identifier}
                      className='nftImg'
                    />
                  </div>
                </div>
                <div>
                  <div className='w-100'></div>
                  <button
                    className='btn btn-primary ml-1 mt-2'
                    onClick={() => sendBuySerumTransaction(serum)}
                  >
                    BUY&nbsp;
                    <FontAwesomeIcon icon={faShop} className='text' />
                  </button>
                </div>
              </LazyLoad>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Serum;

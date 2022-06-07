import * as React from 'react';
import {
  enableVote,
  voteAddress,
  voteFinishData,
  voteNoData,
  voteOwnerAddress,
  voteWithdrawData,
  voteYesData
} from 'config';
import Vote from './Vote';

const Components = () => {
  return (
    <div className='col mt-4 col-md-12'>
      {!!enableVote && (
        <div>
          <hr />
          <Vote
            voteAddress={voteAddress}
            voteOwnerAddress={voteOwnerAddress}
            voteYesData={voteYesData}
            voteNoData={voteNoData}
            voteFinishData={voteFinishData}
            voteWithdrawData={voteWithdrawData}
          />
        </div>
      )}
    </div>
  );
};

export default Components;

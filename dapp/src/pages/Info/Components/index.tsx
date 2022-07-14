import * as React from 'react';
import FloorPrice from './FloorPrice';
import Farms from './Farms';

const Components = () => {
  return (
    <div className='col mt-4 col-md-12'>
      <hr />
      <Farms />
      <hr />
      <FloorPrice />
    </div>
  );
};

export default Components;

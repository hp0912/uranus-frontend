import React from 'react';

// ts interface
import { IUserEntity } from '../types';

export interface IUserContext {
  userState: IUserEntity | null;
  userDispatch?: React.Dispatch<{
    type: string;
    data: IUserEntity | null;
  }>;
}

export const UserContext = React.createContext<IUserContext>({ userState: null });

export const SETUSER = 'SETUSER';

export const reducer = (state: IUserEntity | null, action: { type: string, data: IUserEntity | null }) => {
  switch (action.type) {
    case SETUSER:
      if (action.data) {
        return Object.assign({}, state, action.data);
      } else {
        return null;
      }
    default:
      return null;
  }
};
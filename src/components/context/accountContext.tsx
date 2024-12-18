import { FC, ReactNode, createContext, useContext, useState } from 'react';

import { Account } from '../../model/account';

// Define the shape of the context value
type AccountContextType = {
  account: Account;
  setAccount: (account: Account) => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account>(null);

  return <AccountContext.Provider value={{ account, setAccount }}>{children}</AccountContext.Provider>;
};

export const useAccount = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

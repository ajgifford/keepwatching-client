import { RenderOptions, render } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { AppStore, RootState, setupStore } from './store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, store = setupStore(preloadedState), ...renderOptions }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export function createMockStore(initialState: Partial<RootState> = {}) {
  return setupStore(initialState);
}

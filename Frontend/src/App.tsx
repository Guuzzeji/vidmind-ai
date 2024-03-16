import React from 'react';
import { Provider } from 'react-redux'

import Main from './screens/Main';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

export default App;

import React from 'react';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';

import store from './store';

import Main from './pages/Main/Main';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Main />
      </ChakraProvider >
    </Provider>
  );
}

export default App;

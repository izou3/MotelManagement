import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ensureReady, After } from '@jaredpalmer/after';
import { ThemeProvider, } from '@material-ui/core/styles';
import routes from './setup/routes';
import theme from './setup/theme';

function Main({ data }) {

  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <After data={data} routes={routes} />
      </ThemeProvider>
    </BrowserRouter>
  );
}

ensureReady(routes).then(data =>
  hydrate(<Main data={data} />, document.getElementById('root'))
);

if (module.hot) {
  module.hot.accept();
}
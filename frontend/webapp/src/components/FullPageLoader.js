import React from 'react';

// MaterialUI Components and Icons
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() => ({
  loadContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: '2000',
    backgroundColor: '#F8F8F8AD',
  },
  loader: {
    left: '50%',
    top: '50%',
    zIndex: '3000',
    position: 'absolute',
  },
}));

/**
 * Full Page Loader Component
 * @param {boolean} loading The Loading State of the App to determine if Loader should render or not
 */
const FullPageLoader = (props) => {
  const classes = useStyles();
  const { loading } = props;

  if (!loading) return null;

  return (
    <div className={classes.loadContainer}>
      <CircularProgress className={classes.loader} />
    </div>
  );
};

export default FullPageLoader;

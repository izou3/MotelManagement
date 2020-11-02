/**
 * Module Dependencies
 */
import React from 'react';
import { Route, useHistory } from 'react-router-dom';

//MaterialUI Components and Icons
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FilterHdrTwoToneIcon from '@material-ui/icons/FilterHdrTwoTone';

const useStyles = makeStyles((theme) => ({
  error: {
    textAlign: 'center',
    padding: theme.spacing(6, 10, 6),
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
}));

/**
 * Stateless Component that Renders a 404 Error for Undefined Routes
 */
function Error() {
  const classes = useStyles();
  const history = useHistory();
  return (
    <Route
      render={({ staticContext }) => {
        if (staticContext) staticContext.statusCode = 404;
        return (
          <>
            <Grid className={classes.error}>
              <IconButton
                color="inherit"
                onClick={() => {
                  history.push('/');
                }}
              >
                <FilterHdrTwoToneIcon
                  style={{ margin: 0, fontSize: '12rem' }}
                />
              </IconButton>
              <Typography vriant="h1">
                404 | Opps! Not the 100 Mile View You Were Looking For
              </Typography>
            </Grid>
          </>
        );
      }}
    />
  );
}

export default Error;

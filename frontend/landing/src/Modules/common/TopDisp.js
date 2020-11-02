//Packages/Libraries
import React from 'react';
import MainDisp from '../../img/sunsetflag.jpg';

//MaterialUI components
import {
    CardMedia,
    Grid,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  mainDisplay: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0, 0, 0),
    [theme.breakpoints.down('xs')]: {
      height: '200px',
    },
    [theme.breakpoints.up("sm")]: {
      height: '600px'
    },
    [theme.breakpoints.up("xl")]: {
      height: "1200px"
    },
  },
  MainPost: {
    height: "100%",
    width: '100%',
  },
}));

  function TopDisp() {
    const classes = useStyles();

    return (
      <>
        <Grid container component="main" className={classes.mainDisplay}>
          <CardMedia
            component="img"
            alt="City View"
            image={MainDisp}
            title="City View"
            className={classes.MainPost}
          />
        </Grid>
      </>
    );
  }

  export default TopDisp;

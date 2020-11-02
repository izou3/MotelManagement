//Packages/Libraries
import React from 'react';

//MaterialUI components
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { CssBaseline } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

//components
import NavBar from '../common/NavBar';
import Footer from '../common/Footer';

//API Key
import { GOOGLE_MAPS_API } from '../../setup/config/env';

const useStyles = makeStyles(theme => ({
    display: {
        [theme.breakpoints.down('xs')]: {
            margin: theme.spacing(1, 0),
            padding: theme.spacing(0,0),
            height: '800px'
        },
        [theme.breakpoints.up('sm')]: {
          height: '900px',
          margin: theme.spacing(10, 0, 0),
          padding: theme.spacing(5,5,5),
        },
        [theme.breakpoints.up('md')] :{
            margin: theme.spacing(20, 0, 0),
            padding: theme.spacing(5,5,5),
            height: '1200px'
        },
    },
    map: {
        [theme.breakpoints.down('md')]: {
            height: '100%'
        },
        [theme.breakpoints.up('md')]: {
            height: '100%'
        },
        width: '100%',
        border: 'black solid 6px'
    },
    attractions: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        textAlign: 'center',
        padding: theme.spacing(2,4),
        color: theme.palette.common.black
    }
}));

function Location (props) {
    const classes = useStyles();

    return (
      <React.Fragment>
        <CssBaseline />

        <NavBar {...props}/>
          <Grid className={classes.display}>
              <iframe className={classes.map}
                  src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API}&q=place_id:ChIJS8hfkXRDfYcRmIi7hsYGEuc`}>
              </iframe>
          </Grid>
          <Grid className={classes.attractions}>
              <Typography variant='h4'>Big Sky Lodge Location</Typography>
              <Divider style={{ backgroundColor: 'white', margin:"0.5em" }}/>
              <Typography component='p' variant='h6'>20 Miles from Mt Rushmoore</Typography>
              <Typography component='p' variant='h6'>25 Miles from Hill City and Elk Peak</Typography>
              <Typography component='p' variant='h6'>2 Miles from Downtown Rapid City</Typography>
              <Typography component='p' variant='h6'>51 Miles from Spearfish Canyon</Typography>
              <Typography component='p' variant='h6'>66 Miles from Badlands National Park</Typography>
          </Grid>

        <Footer />
      </React.Fragment>
    );
}

export default Location;

import React from 'react';

import NavBar from '../common/NavBar';
import Footer from '../common/Footer';

import {
    Grid,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core';
import { CssBaseline } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import CheckBoxRoundedIcon from '@material-ui/icons/CheckBoxRounded';

const useStyles = makeStyles(theme => ({
    display: {
        [theme.breakpoints.down('xs')]: {
          margin: theme.spacing(15, 0),
          padding: theme.spacing(0,0),
          height: '800px'
        },
        [theme.breakpoints.up('sm')]: {
          height: '400px',
          margin: theme.spacing(20, 0, 15),
          padding: theme.spacing(5,5,5),
        },
        [theme.breakpoints.up('xl')] :{
            margin: theme.spacing(30, 0, 25),
            padding: theme.spacing(5,5,5),
            height: '600px'
        },
    },
    rates: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      textAlign: 'center',
      padding: theme.spacing(2,4),
      color: theme.palette.common.black
    }
}));

/**
 * Rates 2020
 */
const Rates = [
    'Call Us at (605) 343-4200 for Best Rates, Discounts, and Deals',
    'Summer Rates: $89 For Single Queen and $104 for Double Bed',
    'Please note these rates are not set in stone but a general idea!',
    'Ask us about our suite, groups and stayover discounts'
]

export default function Reservation (props) {
    const classes = useStyles();

    return (
        <React.Fragment>
            <CssBaseline />

            <NavBar {...props}/>

          <Grid container className={classes.display}>
            <Grid item xs={12} sm={5}>
              <iframe
                  src={`https://s3.amazonaws.com/liv-inntopia-share/Widget/horizontal/index.html?sid=815100&supid=655201&stayplayactivities=show&events=hide&air=hide&car=hide&alllodging=hide&lodging=show&golf=hide&lifts=hide&tours=hibiking=show&funpass=hide&equipmentrental=hide&spa=hide&dining=hide&activitiesdest=true&childage=trxdm_e=https%3A%2F%2Fbigskylodge.com&xdm_c=default8365&xdm_p=1`}
                  width='100%'
                  height='100%'>
              </iframe>
            </Grid>
            <Grid item xs={12} sm={7} className={classes.rates}>
                <Typography variant='h4' style={{textAlign: 'center'}}>Big Sky Lodge Rates</Typography>
                <Divider />
                <List>
                    {Rates.map((description, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <CheckBoxRoundedIcon />
                            </ListItemIcon>
                            <ListItemText primary={description} />
                        </ListItem>
                    ))}
                </List>
            </Grid>
            </Grid>
            <Footer />
        </React.Fragment>
    );
}

//Packages/Libraries
import React from 'react';

//MaterialUI imports
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import FilterHdrTwoToneIcon from "@material-ui/icons/FilterHdrTwoTone";
import IconButton from "@material-ui/core/IconButton";
import Hidden from '@material-ui/core/Hidden'

const useStyles = makeStyles(theme => ({
    footer: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        margin: theme.spacing(6, 0, 0),
        padding: theme.spacing(1,5,1),
        textAlign: 'right',
        fontStyle: 'bold',
        icon: {
          align: 'left'
        }
      },
}));

function Footer(props) {
    const classes = useStyles();

    return (
        <Hidden smDown>
        <Grid container className={classes.footer}>
          <Grid item xs={8} style={{textAlign: 'left', margin: 'auto'}}>
            <IconButton color="inherit">
              <FilterHdrTwoToneIcon style={{margin: 0, fontSize: '4rem'}}/>
            </IconButton>
          </Grid>

          <Grid item xs={4}>
            <Typography component={'p'} variant={'body1'}>4080 Tower Road Rapid City | South Dakota | 57701 </Typography>
            <Typography component={'p'} variant={'body1'}>rapidcitymotels.bigskylodge@gmail.com</Typography>
            <Typography component={'p'} variant={'body1'}>(605) 348-3200</Typography>
            <Typography component={'p'} variant={'body1'}>@{new Date().getFullYear()} All Rights Reserved</Typography>
          </Grid>
        </Grid>
    </Hidden>
    );
}

export default Footer;

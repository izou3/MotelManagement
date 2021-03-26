//Packages/Libraries
import React from 'react';

//MaterialUI components
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
import { CardMedia } from '@material-ui/core';
import CheckBoxRoundedIcon from '@material-ui/icons/CheckBoxRounded';
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles(theme => ({
    contentMain: {
        margin: theme.spacing(0, 0, 0),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(0, 0, 4)
        },
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(6, 6, 0),
        },
        textAlign: 'center',
        [theme.breakpoints.up('xl')]: {
            fontSize: '2rem'
        }
      },
      contentPara: {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          textAlign: 'left',
          padding: theme.spacing(2,4),
      },
      height: {
          [theme.breakpoints.up('xl')]: {
              height: '600px'
          },
          height: '400px'
      },
      fontSize: {
          [theme.breakpoints.up('xl')]: {
              fontSize: '2rem'
          }
      }
}));

function Pet (props) {
    const classes = useStyles();
    const img = props.img ? props.img : "https://source.unsplash.com/random";

    return (
        <React.Fragment>
            <CssBaseline />

            <Grid id={props.id} container direction={props.flow} className={classes.contentMain}>
                <Grid item xs={12} lg={5}>
                  {
                    img ? <CardMedia
                      className={classes.height}
                      component="img"
                      alt="Picture of Room"
                      image={img}
                      title="Room"
                    /> : (<CircularProgress />)
                  }
                </Grid>

                <Grid item xs={12} lg={7} className={classes.contentPara}>
                    <Typography variant="h3">{props.title}</Typography>
                    <List>
                        {props.content.map((description, index) => (
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

        </React.Fragment>
    );
}

export default Pet;

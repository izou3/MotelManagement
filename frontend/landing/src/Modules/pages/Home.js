//Packages/Libraries
import React from 'react';

/**
 * Image Imports
 */
import ScenricDouble from '../../img/double.jpg';
import Amenities from '../../img/amenities.jpg';
import SkylineSuites from '../../img/suites.jpg';
import View from '../../img/bsl2.jpg';
import SkyLogo from '../../img/Logo.jpg';

/**
 * MaterialUI Imports
*/
import {
  Button,
  Divider,
  CardMedia,
  CssBaseline,
  Grid,
  withWidth,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

//Components
import TopDisp from '../common/TopDisp';
import NavBar from '../common/NavBar';
import Footer from '../common/Footer';
import BookingMod from '../common/BookingMod';

const useStyles = makeStyles(theme => ({
  content: {
    backgroundColor: theme.palette.background.paper,
    overflow: "auto",
    textAlign: "center",
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2,8,1),
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(3,12,1),
    },
  },
  MainPost: {
    marginTop: 'auto',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3,2,2),
    },
    [theme.breakpoints.up('xl')]: {
      padding: theme.spacing(5,12,4),
    },
  },
  bookButton: {
    margin: "1em",
    padding: theme.spacing(2, 7, 2)
  },
  logo: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '1.5em',
    [theme.breakpoints.down('sm')]: {
      height: '40%',
      width: '40%'
    },
    height: '20%',
    width: '20%'
  },
  collage: {
    [theme.breakpoints.down('xs')]: {
      height: '200px',
      margin: theme.spacing(1,0,1),
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      height: '350px',
      margin: theme.spacing(2,0,2),
    },
    [theme.breakpoints.up('xl')]: {
      height: '600px',
      margin: theme.spacing(4,0,4),
    },
  },
  collagePic: {
    height: '100%',
  },
  reviewContainer: {
    [theme.breakpoints.up('xs')]: {
      height: '300px',
      margin: theme.spacing(2,0,2),
    },
    [theme.breakpoints.up('lg')]: {
      height: '430px',
      margin: theme.spacing(3,0,2),
    },
    [theme.breakpoints.up('xl')]: {
      height: '450px',
      margin: theme.spacing(6,0,2),
    },
  },
  review: {
    padding: theme.spacing(2,2,2),
    height: '100%',
    borderStyle: 'solid',
    borderWidth: '5px',
    borderColor: '#DAA520',
  },
  reviewDivider: {
    margin: theme.spacing(3,2,3),
  }
}));

function Home(props) {
  const classes = useStyles();
  const [bookMod, setBookMod] = React.useState(false);

  const handleModalOpen = () => {
    setBookMod(true);
  }

  const handleClose = () => {
    setBookMod(false);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <TopDisp />
      <NavBar  {...props}/>
      <BookingMod open={bookMod} handleClose={handleClose}/>
      <Grid container className={classes.content}>
        <Grid item xs={12} className={classes.MainPost}>
          <CardMedia
            component="img"
            className={classes.logo}
            image={SkyLogo}
            title='Big SKy Logo'
          />
          <Card elevation={0} className={classes.bookNow}>
            <CardHeader title=
              {
              <Typography variant='h4'>
                  "In the City But In The Pines Overlooking Rapid City on Picturesque Skyline Drive."
              </Typography>
              }
            />
            <CardContent>
              <Typography variant="h6">
                Lose yourself in the gorgeous and screne surrondings of our 100 mile hot tub as you relax and rest up in
                our clean and comfy rooms. Enjoy a pinic in our pet park out front or take an adventure into the beautiful Black Hills.
                As Mom and Pop lodge in the quiet mountain pines, our affordable, clean and quiet rooms are the perfect
                basecamp for all your endeavours. Just Shoot Us A Call and We'll Get You Started!!
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                className={classes.bookButton}
                onClick={handleModalOpen}
                value='hello'
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid container justify="space-around">
          <Grid item xs={12} sm={7} className={classes.collage}>
            <CardMedia
              className={classes.collagePic}
              component="img"
              alt="City View"
              image={View}
              title="View"
            />
          </Grid>
          <Grid item xs={12} sm={4} className={classes.collage}>
            <CardMedia
              className={classes.collagePic}
              component="img"
              alt="City View"
              image={SkylineSuites}
              title="View"
            />
          </Grid>
          <Grid item xs={12} sm={3} className={classes.collage}>
            <CardMedia
              className={classes.collagePic}
              component="img"
              alt="City View"
              image={ScenricDouble}
              title="View"
            />
          </Grid>
          <Grid item xs={12} sm={8} className={classes.collage}>
            <CardMedia
              className={classes.collagePic}
              component="img"
              alt="City View"
              image={Amenities}
              title="View"
            />
          </Grid>
        </Grid>

        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.reviewContainer}
        >
          <Grid item xs={12} md={4} className={classes.review}>
              <Typography variant="h6">
              We really loved the place. The owners were very kind and asked us daily if there was anything we needed. The location is perfect, just a few miles from Rapid City. We will book there again next time we go
              </Typography>
              <Divider className={classes.reviewDivider} />
              <Typography variant="h6">
                Kimberley | Google
              </Typography>
          </Grid>
          <Grid item xs={12} md={4} className={classes.review}>
              <Typography variant="h6">
              Very friendly and help full staff. Amazing view of Rapid City. I wanted to take the mattress home with . It was so comfortable. Great pressure on the shower. I didn't bring a blower dryer to doy hair and had one I borrowed. I will be back!
              </Typography>
              <Divider className={classes.reviewDivider} />
              <Typography variant="h6">
                Pamela | TripAdvisor
              </Typography>
          </Grid>
          <Grid item xs={12} md={4} className={classes.review}>
              <Typography variant="h6">
                It was a clean, cute place. Staff was friendly. There were plenty of linens and the bed was comfortable.
              </Typography>
              <Divider className={classes.reviewDivider} />
              <Typography variant="h6">
                Veronica | Expedia
              </Typography>
          </Grid>
        </Grid>

      </Grid>
      <Footer />
    </React.Fragment>
  );
}

Home.getInitialProps = async ({
  req,
  res,
  match,
  history,
  location,
  ...ctx
}) => {
  return { whatever: 'stuff' };
};

export default withWidth()(Home);

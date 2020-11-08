//Packages/Libraries
import React from 'react';

/**
 * picture Imports
 */
import MainDisp from '../../img/outsideday.jpg';
import Amenities from '../../img/amenities.jpg';
import Single from '../../img/singleQueen2.jpg';
import Double from '../../img/double2.jpg';
import DoubleQueen from '../../img/DoubleQueen.jpg';
import Skyline from '../../img/Skyline.jpg';
import Triple from '../../img/double.jpg';

//MaterialUI components
import { CssBaseline, Grid, CardMedia, Card, CardHeader, CardContent, Typography, Divider } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

//components
import NavBar from '../common/NavBar';
import Footer from '../common/Footer';

const roomInfo = [
    {
        flow: 'row',
        id: 'amenities',
        picture: Amenities,
        title: 'Amenities',
        content: [
            'Non-Smoking Rooms',
            'Pet Friendly Park and Garden',
            'Scenic Viewing and Picnic Area',
            'Parking at your Door. All One Level',
            'Wireless Internet Access and Dish TV',
            'Breakfast (Grab & Go) and Outdoor Hot Tub (Unavailable this Season)',
        ]
    },
    {
        flow: 'row-reverse',
        id: 'single',
        picture: Single,
        title: 'Single Queen',
        content: [
            'One Single Queen Bed',
            'Garden View',
            'In-Room Coffee and Fresh Linens',
            'Microwave/Mini-Fridge',
            'Alarm Clock/Hair Dryer/Iron',
            'Closet/Storage Area'
        ]
    },
    {
        flow: 'row',
        id: 'double',
        picture: Double,
        title: 'Sceneric Double',
        content: [
            'Two Double/Full Sized Beds',
            'City and Mountain View',
            'In-Room Coffee and Fresh Linens',
            'Microwave/Mini-Fridge',
            'Alarm Clock/Hair Dryer/Iron',
            'Closet/Storage Area'
        ]
    },
    {
        flow: 'row-reverse',
        id: 'skyline',
        picture: DoubleQueen,
        title: 'Skyline Queens',
        content: [
            '2-4 Queens Beds',
            'City and Garden Patio View',
            'In-room Sofa Viewing Area',
            'In-Room Coffee and Fresh Linens',
            'Microwave/Mini-Fridge',
            'Closet/Storage Area and Alarm Clock/Hair Dryer'
        ]
    },
    {
        flow:'row',
        id: 'skylinetriple',
        picture: Triple,
        title: 'Skyline Triple',
        content: [
            '3 Double/Fill Sized Beds in 2 Bedrooms',
            'City and Mountain View',
            'In-Room Coffee, 2 TVs and Storage Area',
            'Microwave/Mini-Fridge',
            'Alarm Clock/Hair Dryer/Iron',
        ]
    },
    {
        flow:'row-reverse',
        id: 'skylinesuite',
        picture: Skyline,
        title: 'Skyline Suite',
        content: [
            'Two BedRoom Suite with Kitchen and Living Area',
            'One Queen, One King, and Sofa',
            'Stovetop Kitchen with Fridge and Dishwasher',
            '3 Tvs and Closet/Storage Area',
            'In-Room Coffee and Fresh Linens',
        ]
    }
]

const useStyles = makeStyles(theme => ({
  mainDisplay: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0, 0, 0),
    [theme.breakpoints.down('xs')]: {
      height: '200px'
    },
    [theme.breakpoints.up('sm')]: {
      height: '350px',
    },
    [theme.breakpoints.up('lg')]: {
      height: '480px',
    },
  },
  MainPost: {
    height: "100%",
    width: '100%',
  },
  accomodations: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    [theme.breakpoints.down('xs')]: {
      height: '300px',
      margin: theme.spacing(1,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      height: '400px',
      margin: theme.spacing(2,2,2)
    },
    [theme.breakpoints.up('lg')]: {
      height: '500px',
      margin: theme.spacing(4,4,4)
    },
  },
  image: {
    [theme.breakpoints.down('xs')]: {
      height: '100px',
    },
    [theme.breakpoints.up('sm')]: {
      height: '175px',
    },
    [theme.breakpoints.up('lg')]: {
      height: '250px',
    },
  },
  RoomDes: {
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3,5,3),
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(5,7,5),
    },
  },
  divider: {
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(1,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(2,5,1),
    },
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(5,7,5),
    },
  },
  policies: {
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1,1,1),
      margin: theme.spacing(0, 0, 7),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3,10,3),
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(5,20,5),
    },
  },
  policy: {
    margin: theme.spacing(3,0,0),
  }
}));

function Room (props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <CssBaseline />
        <Grid container component="main" className={classes.mainDisplay}>
          <CardMedia
            component="img"
            alt="City View"
            image={MainDisp}
            title="City View"
            className={classes.MainPost}
          />
        </Grid>
        <NavBar {...props}/>
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="center"
        >
          <Grid item xs={12} className={classes.RoomDes}>
            <Typography variant="h4">
              Big Sky Lodge Accomodations
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Rest assured that your room has been taken care of and inspected by our wonderful housekeeping staff!
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Please inquiry about our adjoining for larger accomodations!
            </Typography>
            <Divider className={classes.divider}/>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Single Queen"
                subheader="Single Queen Bed with Garden View"
              />
              <CardMedia
                component="img"
                alt="Single Queen"
                image={Single}
                title="Single Queen"
                className={classes.image}
              />
              <CardContent>
                <Typography variant="body2" component="p">
                  Enjoy our quiet and relaxing single queen rooms facing our fresh
                  yard out front. Room is equippied with FREE wifi, Dish TV,
                  alarm clock, microwave, and mini-fridge. NON-SMOKING. Sleeps 2.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Scenic Double"
                subheader="Two Full beds with City View"
              />
              <CardMedia
                component="img"
                alt="2 Full beds"
                image={Double}
                title="2 Full Beds"
                className={classes.image}
              />
              <CardContent>
                <Typography variant="body2" component="p">
                  A gorgeous and breathtaking view of Rapid City awaits outside your window.
                  Room is equippied with FREE wifi, Dish TV, alarm clock, microwave, and mini-fridge.
                  NON-SMOKING. Sleeps 4.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Triple Full"
                subheader="Triple Full Bed with City View"
              />
              <CardMedia
                component="img"
                alt="3 Full beds"
                image={Triple}
                title="3 Full Beds"
                className={classes.image}
              />
              <CardContent>
                <Typography variant="body2" component="p">
                  A gorgeous room with two full beds and an attachment bedroom
                  with extra full bed and TV for privacy. Room is equippied with
                  FREE wifi, Dish TV, xmicrowave, and mini-fridge. NON-SMOKING. Sleeps 5.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Double Queen with Patio"
                subheader="2 Queen Beds"
              />
              <CardMedia
                component="img"
                alt="2 Queen Beds"
                image={DoubleQueen}
                title="2 Queen Beds"
                className={classes.image}
              />
              <CardContent>
                <Typography variant="body2" component="p">
                  Enjoy our extra spacious double queen rooms. Room is equippied with FREE wifi, Dish TV, alarm clock,
                  microwave, and mini-fridge. NON-SMOKING. Sleeps 4.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Skyline Suite"
                subheader="Two Bedroom with Kitchen and Sofa"
              />
              <CardMedia
                component="img"
                alt="Skyline"
                image={Skyline}
                title="Skyline"
                className={classes.image}
              />
              <CardContent>
                <Typography variant="body2" component="p">
                  Enjoy our biggest room in house.
                  Equippied with a separate king bedroom, queen bedroom, a pullout couch and a full kitchen, the skyline suite
                  is perfectly suited for the larger accomodations and longer stays in the beautiful Black Hills
                </Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="center"
          className={classes.policies}
        >
          <Grid item xs={12} className={classes.RoomDes}>
            <Divider className={classes.divider}/>
            <Typography variant="h4">
              Big Sky Lodge Policies
            </Typography>
            <Divider className={classes.divider}/>
          </Grid>
          <Grid item xs={12} className={classes.policy}>
            <Typography variant="h6">Check-In: 3:00 PM</Typography>
            <Typography variant="h6">Check-Out: 11:00 AM</Typography>
          </Grid>
          <Grid item xs={12} className={classes.policy}>
            <Typography variant="h6">Cancellation Policy: </Typography>
            <Typography variant="body1">
              Cancellations made to a reservation within 48 hours of the arrival date
              is subject to a one-night fee. This policy, however, does not apply on the
              week of the Sturgis Rally. Please contact the property separately for those reservations
              and cancellation policies. There is NO Refund for No-Shows.
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.policy}>
            <Typography variant="h6">Pet Policy: </Typography>
            <Typography variant="body1">
              . Please declare your dog(s) when making your reservation. We only have limited pet rooms
            </Typography>
            <Typography variant="body1">
              . We only accept small to medium sized dogs (under 30 lbs)
            </Typography>
            <Typography variant="body1">
              . We do charge an additional pet fee of $15 per pet per night as well as a $50 pet deposit.
            </Typography>
            <Typography variant="body1">
              . The hotel may charge a guest if services are required for excessive cleaning or if damages are incurred as a result of the guest’s pet.
            </Typography>
            <Typography variant="body1">
            Hotel management has sole discretion to ask a pet owner to find other accommodations if they deem the pet to be dangerous, harmful, or disruptive to other hotel guests.
            </Typography>
          </Grid>

        </Grid>

        <Footer />
    </React.Fragment>
  );
}

export default Room;

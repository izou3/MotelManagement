//Packages/Libraries
import React from 'react';

//MaterialUI components
import {
  CssBaseline,
  Grid,
  CardMedia,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider
} from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

/**
 * Pictures
 */
import MainDisp from '../../img/outsideday.jpg';
import Rushmoore from '../../img/rushmore.jpg';
import Badlands from '../../img/badlands.jpg';
import SkylineDrive from '../../img/bear_country.jpg';
import Custer from '../../img/custer.jpg';

//components
import NavBar from '../common/NavBar';
import Footer from '../common/Footer';

/**
 * Attraction Array
 */
const AttractionsArray = [
  {
      flow: 'row',
      id: 'mountrushmoore',
      picture: Rushmoore,
      title: 'Mount Rushmoore',
      content: [
          '20 Miles Away and a 30 Minute Scenic Drive Through The Black Hills',
          'The Sculptures of George Washington, Thomas Jefferson, Theodore Roosevelt and Abraham Lincoln are immortalized and forever awed at by thousands of visitors every year.',
          `For More Information on Hours and Sites visit: https://www.nps.gov/moru/index.htm`
      ]
  },
  {
      flow: 'row',
      id: 'skylinedrive',
      picture: SkylineDrive,
      title: 'Skyline Drive/Dinosaur Park',
      content: [
          'Right down the street from our lodge. Indulge in the best road of Rapid City',
          'Take the mile road ending at Dinosaur Park with trails and parking spots along the drive',
          'Experience the Wonderous view of the Black Hills on one and Rapid City on the Other'
      ]
  },
  {
      flow: 'row',
      id: 'badlands',
      picture: Badlands,
      title: 'Badlands National Park',
      content: [
          'An hour drive away from the Gorgeous Badlands National Park',
          'The parks consists of 244,000 acres of sharply eroded buttes, pinnacles and spires blended with the largest, protected mixed grass prairie in the United States.',
          `For More Information on Hours and Sites visit: https://www.nps.gov/badl/index.htm`
      ]
  },
];

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
      height: '450px',
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
      margin: theme.spacing(0,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      height: '350px',
      margin: theme.spacing(1,2,2)
    },
    [theme.breakpoints.up('lg')]: {
      height: '500px',
      margin: theme.spacing(2,4,4)
    },
  },
  moreAttractions: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(0,1,1),
    },
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(1,2,2)
    },
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(2,4,4)
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
      margin: theme.spacing(3,5,3),
    },
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(5,7,5),
    },
  },
}));

function Attractions (props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <CssBaseline />
        <Grid container component="main" className={classes.mainDisplay}>
          {
            process.browser ?
              <CardMedia
                component="img"
                alt="City View"
                image={MainDisp}
                title="City View"
                className={classes.MainPost}
              /> : (null)
          }
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
              Adventure in the Black Hills
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Stay Longer! Play Longer!
            </Typography>
            <Divider className={classes.divider}/>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Mount Rushmoore"
              />
              {
                process.browser ?
                  <CardMedia
                    component="img"
                    alt="Rushmoore"
                    image={Rushmoore}
                    title="Rushmoore"
                    className={classes.image}
                  /> : (null)
              }
              <CardContent>
                <Typography variant="body2" component="p">
                Mount Rushmore National Memorial is a massive sculpture carved into Mount Rushmore in the Black Hills region of South Dakota. The memorial depicts U.S. presidents George Washington, Thomas Jefferson, Theodore Roosevelt and Abraham Lincoln.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Badlands National Park"
              />
              {
                process.browser ?
                  <CardMedia
                    component="img"
                    alt="Badlands"
                    image={Badlands}
                    title="Badlands"
                    className={classes.image}
                  /> : (null)
              }
              <CardContent>
                <Typography variant="body2" component="p">
                An hour drive away from the Gorgeous Badlands National Park,
                this screne landscape consists of 244,000 acres of sharply eroded buttes, pinnacles and spires blended with the largest, protected mixed grass prairie in the United States.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Bear Country and Reptile Garden"
              />
              {
                process.browser ?
                  <CardMedia
                    component="img"
                    alt="SkylineDrive"
                    image={SkylineDrive}
                    title="SkylineDrive"
                    className={classes.image}
                  /> : (null)
              }
              <CardContent>
                <Typography variant="body2" component="p">
                From your vehicles, observe the wildlife of the Black Hills. Then head on over to Reptile Garden to explore reptiles of all sizes from giant turtles and crocodiles to slithering snakes in beautiful botanical gardens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Card className={classes.accomodations}>
              <CardHeader
                title="Custer State Park"
              />
              {
                process.browser ?
                  <CardMedia
                    component="img"
                    alt="Custer State Park"
                    image={Custer}
                    title="Custer State Park"
                    className={classes.image}
                  /> : (null)
              }
              <CardContent>
                <Typography variant="body2" component="p">
                Custer State Park is a South Dakota State Park and wildlife reserve in the Black Hills, United States. The park is South Dakota's largest and its first state park, named after Lt. Colonel George Armstrong Custer. Home to more thsn 1,400 buffalos, it is one of the world's largest publicly owned bison herds.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} className={classes.RoomDes}>
            <Typography variant="h5">
              Other Adventures and Many More
            </Typography>
            <Divider className={classes.divider}/>
          </Grid>

          <Grid container>
            <Grid item xs={12} sm={4}>
              <Card className={classes.moreAttractions}>
                <CardHeader
                  title="SkyLine Drive"
                />
                <CardContent>
                  <Typography variant="body2" component="p">
                  Take the mile road ending at Dinosaur Park with trails and parking spots along the drive.
                  Experience the Wonderous view of the Black Hills on one and Rapid City on the Other!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card className={classes.moreAttractions}>
                <CardHeader
                  title="Wind Cave National Park"
                />
                <CardContent>
                  <Typography variant="body2" component="p">
                  Explore the vast underground Wind Cave, one of the longest and most complex caves in the world.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card className={classes.moreAttractions}>
                <CardHeader
                  title="1880 Train "
                />
                <CardContent>
                  <Typography variant="body2" component="p">
                  Embark on the two-hour, narrated 20-mile round trip between Hill City and Keystone. Passengers view vistas of Harney Peak, mining encampments and participate in good old-fashioned fun.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

        </Grid>
        <Footer />
    </React.Fragment>
  );
}

export default Attractions;

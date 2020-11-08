//Packages/Libraries
import React from 'react';
import { Link } from 'react-router-dom';

//MaterialUI components
import {
    ButtonBase,
    Grid,
    Toolbar,
    withWidth,
    Typography,
    AppBar,
    BottomNavigation,
    BottomNavigationAction,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import BookIcon from "@material-ui/icons/Book";
import FilterHdrIcon from '@material-ui/icons/FilterHdr';

//components
import BookingModal from './BookingMod';

const useStyles = makeStyles(theme => ({
    overlay: {
      position: "fixed",
      top: "0",
      [theme.breakpoints.down('xs')]: {
        height: '110px',
      },
      [theme.breakpoints.between('sm', 'lg')]: {
        height: '150px',
      },
      [theme.breakpoints.up('xl')]: {
        height: '210px',
      },
      background: 'linear-gradient(to bottom, var(--start) 0%, var(--middle) 60%, var(--end) 100%)',
      color: theme.palette.common.white,
      webkitTransition: 'background 500ms ease-out 1s',
      mozTransition: 'background 500ms ease-out 1s',
      oTransition: 'background 500ms ease-out 1s',
      transition: 'background 0.5s ease-out 1s',
    },
    appBar: {
      [theme.breakpoints.down("md")]: {
        top: "auto",
        bottom: 0
      },
      [theme.breakpoints.up("md")]: {
        position: "sticky",
        top: 0
      },
      backgroundColor: theme.palette.common.white,
    },
    bottomBar: {
      position: "sticky",
      top: 0,
      borderBottom: "solid black"
    },
    desktopTitleNav: {
      padding: theme.spacing(2, 2, 1),
      textAlign: "center",
      color: theme.palette.common.white,
      "&:hover": {
        zIndex: 1,
        opacity: 0.25
      }
    },
    destopNav: {
      padding: theme.spacing(5, 5, 1),
      textAlign: "center",
      color: theme.palette.common.white,
      "&:hover": {
        zIndex: 1,
        opacity: 0.25
      }
    },
    navLinks: {
      color: theme.palette.common.white,
      textDecoration: 'none'
    }
  }));

  const topColor = {
    '--start': 'rgba(0,0,0,1)',
    '--end': 'rgba(0,0,0,0)',
    '--middle': 'rgba(0,0,0,0.3)',
  }

  const scrollColor = {
    '--start': 'rgba(0,0,0,0.9)',
    '--end': 'rgba(0,0,0,0.9)',
    '--middle': 'rgba(0,0,0,0.9)',
  }

  function NavBar(props) {
    const classes = useStyles();
    const { width } = props;
    const [value, setValue] = React.useState("Home");
    const [bookMod, setBookMod] = React.useState(false);

    const [navColor, setNavColor] = React.useState(topColor);

    React.useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 300) {
          setNavColor(topColor);
        } else {
          setNavColor(scrollColor);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [navColor]);

    const handleChange = (event, newValue) => {
      if (newValue === 'reserve') {
        setBookMod(true);
      } else {
        setValue(newValue);
        props.history.push(newValue);
      }
    };

    const handleClose = () => {
      setBookMod(false);
    }

     const navBar = width === "xs" ? (
       <>
        <AppBar elevation={0} className={classes.overlay} style={navColor}>
          <ButtonBase style={{ width: "100%" }}>
            <Typography variant="h4">
              <Link to="/home" className={classes.navLinks}>Big Sky Lodge</Link>
                </Typography>
          </ButtonBase>
          <Typography style={{ textAlign: 'center' }} variant="h6">The 100 Mile View</Typography>
        </AppBar>
        <AppBar className={classes.appBar}>
          <BottomNavigation
            value={value}
            onChange={handleChange}
            className={classes.bottomBar}
          >
            <BottomNavigationAction
              label='Home'
              value="home"
              icon={<HomeIcon />}
            />
            <BottomNavigationAction
              label="Accomodation"
              value="rooms"
              icon={<MeetingRoomIcon />}
            />
            <BottomNavigationAction
              label="Attractions"
              value="attractions"
              icon={<FilterHdrIcon/>}
            />
            <BottomNavigationAction
              label="Attractions"
              value="location"
              icon={<LocationOnIcon />}
            />
            <BottomNavigationAction
              label="Reserve"
              value="reserve"
              icon={<BookIcon />}
            />
          </BottomNavigation>
        </AppBar>
        </>
      ) : (
        <AppBar elevation={0} className={classes.overlay} style={navColor}>
          <Toolbar style={{ padding: 0 }}>

            <Grid container direction="row">
              <Grid xs={4} item className={classes.desktopTitleNav}>
                <ButtonBase style={{ width: "100%" }}>
                  <Typography variant="h3">
                    <Link to="/home" className={classes.navLinks}>Big Sky Lodge</Link>
                  </Typography>
                </ButtonBase>
                <Typography variant="h5">The 100 Mile View</Typography>
              </Grid>

              <Grid xs={2} item className={classes.destopNav}>
                <ButtonBase style={{ width: "100%" }}>
                  <Typography variant="h6">
                    <Link to='/rooms' className={classes.navLinks}>
                      Accomodations
                    </Link>
                  </Typography>
                </ButtonBase>
              </Grid>
              <Grid xs={2} item className={classes.destopNav}>
                <ButtonBase style={{ width: "100%" }}>
                  <Typography variant="h6">
                    <Link to='/location' className={classes.navLinks}>
                      Location
                    </Link>
                  </Typography>
                </ButtonBase>
              </Grid>
              <Grid xs={2} item className={classes.destopNav}>
                <ButtonBase style={{ width: "100%" }}>
                  <Typography variant="h6">
                    <Link to='/attractions' className={classes.navLinks}>
                      Attractions
                    </Link>
                  </Typography>
                </ButtonBase>
              </Grid>

              <Grid xs={2} item className={classes.destopNav}>
                <ButtonBase style={{ width: "100%" }}>
                  <Typography variant="h6">
                    <Link to='/reservations' className={classes.navLinks}>
                      Book Now!
                    </Link>
                  </Typography>
                </ButtonBase>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      );

    return (
      <React.Fragment>
        {navBar}
        <BookingModal open={bookMod} handleClose={handleClose}/>
      </React.Fragment>
    );
  }

  export default withWidth()(NavBar);

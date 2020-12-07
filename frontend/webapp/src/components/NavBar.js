/* eslint-disable no-nested-ternary */
/**
 * Module Dependencies
 */
import React from 'react';
import clsx from 'clsx';
import { Link, useHistory } from 'react-router-dom';

// MaterialUI Components
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

// MaterialUI Icons
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LocalLaundryServiceIcon from '@material-ui/icons/LocalLaundryService';
import BuildIcon from '@material-ui/icons/Build';
import ListAltIcon from '@material-ui/icons/ListAlt';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ContactsIcon from '@material-ui/icons/Contacts';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MailOutlineIcon from '@material-ui/icons/MailOutline';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  dailySummary: {
    margin: theme.spacing(0, 1, 0),
    textAlign: 'center',
    width: '22%',
    header: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  calendar: {
    width: 'auto',
    border: 'none',
    borderRadius: '5px',
  },
  linkLabels: {
    textDecoration: 'none',
    color: theme.palette.common.black,
  },
  logout: {
    position: 'absolute',
    right: 0,
    paddingRight: '2rem',
  },
}));

/**
 * Stateless Componenent to Render the Icon Links for the NavBar
 * @param {Number} position The Position of the Authenticated User to Detemerine which Links to Render
 */
const NavBarLink = (props) => {
  const classes = useStyles();
  const { position } = props;

  return (
    <>
      <List>
        {position < 2 ? (
          <>
            <Link to="/staff" className={classes.linkLabels}>
              <ListItem button>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
            </Link>
            <Link to="/staff/search" className={classes.linkLabels}>
              <ListItem button>
                <ListItemIcon>
                  <ContactsIcon />
                </ListItemIcon>
                <ListItemText primary="Search" />
              </ListItem>
            </Link>
            <Link to="/staff/report" className={classes.linkLabels}>
              <ListItem button>
                <ListItemIcon>
                  <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary="Daily Report" />
              </ListItem>
            </Link>
            <Link to="/staff/maintenance" className={classes.linkLabels}>
              <ListItem button>
                <ListItemIcon>
                  <BuildIcon />
                </ListItemIcon>
                <ListItemText primary="Maintenance Log" />
              </ListItem>
            </Link>
          </>
        ) : null}
        <Link to="/staff/housekeeping" className={classes.linkLabels}>
          <ListItem button>
            <ListItemIcon>
              <LocalLaundryServiceIcon />
            </ListItemIcon>
            <ListItemText primary="Housekeeping" />
          </ListItem>
        </Link>
      </List>
      <Divider />
      {position === 0 ? (
        <List>
          <Link to="/staff/taxreport" className={classes.linkLabels}>
            <ListItem button>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Tax Report" />
            </ListItem>
          </Link>
          <Link to="/dash" className={classes.linkLabels}>
              <ListItem button>
                <ListItemIcon>
                  <MailOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="Email" />
              </ListItem>
            </Link>
          <Link to="/staff/housekeeping" className={classes.linkLabels}>
            <ListItem button>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItem>
          </Link>
          <Link to="/staff/staff" className={classes.linkLabels}>
            <ListItem button>
              <ListItemIcon>
                <SupervisorAccountIcon />
              </ListItemIcon>
              <ListItemText primary="Staff" />
            </ListItem>
          </Link>
        </List>
      ) : null}
    </>
  );
};

/**
 * Stateless Component to Render the NavBar for the App and All Components to Inherit
 * @param {Object} userInfo The Information of the Authenticated User
 */
const Navbar = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { userInfo, motelInfo } = props;

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const logoutOnAction = () => {
    props.logout(() => {
      return history.push('/staff/login');
    });
  };

  return (
    <>
      {userInfo.firstName ? (
        <>
          <CssBaseline />
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open,
            })}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                className={clsx(classes.menuButton, {
                  [classes.hide]: open,
                })}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap>
                {motelInfo.MotelName + ' Management'}
              </Typography>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={logoutOnAction}
                className={classes.logout}
              >
                <ExitToAppIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}
          >
            <div className={classes.toolbar}>
              {open ? (
                <>
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item>
                      <AccountCircleOutlinedIcon />
                    </Grid>
                    <Grid item>
                      <Typography>{`${userInfo.firstName} ${userInfo.lastName}`}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>
                        {userInfo.position === 0
                          ? 'Owner'
                          : userInfo.position === 1
                          ? 'Manager'
                          : 'Housekeeper'}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              ) : null}
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <NavBarLink position={userInfo.position} />
          </Drawer>
        </>
      ) : null}
    </>
  );
};

export default Navbar;

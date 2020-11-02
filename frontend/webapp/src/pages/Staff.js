/**
 * Module Dependencies
 */
import React from 'react';

// MaterialUI Components
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

// MaterialUi Icons
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import AddIcon from '@material-ui/icons/Add';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

// Redux
import { connect } from 'react-redux';

import { logoutStaff } from '../redux/thunks/authThunks';
import { getAllStaff, updateStaff, deleteStaff, createNewStaff } from '../redux/thunks/staffThunks';

import {
  snackBarFail,
  snackBarSuccess,
  snackBarClose,
} from '../redux/actions/actions';

import {
  loadFormFail,
  loadFormWithStaffData,
  loadFormForNewStaff,
} from '../redux/actions/formActions';

// Components
import { StyledTableCell, StyledTableRow } from '../components/tables/StyledTable';
import FullPageLoader from '../components/FullPageLoader';
import NavBar from '../components/NavBar';
import MyForm from '../components/Form';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
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
  search: {
    width: '30%',
    marginBottom: '1em',
    padding: theme.spacing(1),
  },
  actions: {
    padding: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  staffDisp: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  table: {
    marginTop: '2em',
  },
  avatar: {
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.main,
  },
}));

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Staff({
  auth,
  formOpen,
  formData,
  formType,
  staff,
  loading,
  snackBar,
  initialStaffLoad,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  loadFormNewStaff,
  loadForm,
  closeForm,
  logout,
  closeSnackBar,
}) {
  const classes = useStyles();

  React.useEffect(() => {
    console.log('here in effect');
    initialStaffLoad()
  }, [initialStaffLoad]);

  const hideFormOnAction = () => closeForm();
  const loadFormOnAction = (data) => loadForm(data);
  const createNewStaff = () => loadFormNewStaff();

  const addStaffOnAction = (newStaff) => addEmployee(newStaff);
  const updateStaffOnAction = (updatedStaff) => updateEmployee(updatedStaff);
  const deleteStaffOnAction = (username) => deleteEmployee(username);

  return (
    <>
      <div className={classes.root}>
        <CssBaseline />
        <NavBar logout={logout} userInfo={auth.user} />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Snackbar
            open={snackBar.open}
            autoHideDuration={2000}
            onClose={closeSnackBar}
          >
            <Alert severity={snackBar.alert}>{snackBar.message}</Alert>
          </Snackbar>
          <FullPageLoader loading={loading} />
          <MyForm
            open={formOpen}
            data={formData}
            type={formType}
            handleClose={hideFormOnAction}
            action1={addStaffOnAction}
            action2={updateStaffOnAction}
            action3={deleteStaffOnAction}
          />
          <div className={classes.staffDisp}>
            <AppBar position="static" color="secondary">
              <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                  <SupervisorAccountIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                  Staff
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => createNewStaff()}
                >
                  New Staff
                </Button>
              </Toolbar>
            </AppBar>
            <TableContainer component={Paper} className={classes.table}>
              <Table>
                <TableBody>
                  {
                    staff.map((staffMember) => {
                      let position = 'Manager';
                      switch(staffMember.position) {
                        case 0: position = 'Owner'; break;
                        case 1: position = 'Manager'; break;
                        case 2: position = 'Housekeeper'; break;
                        default: position = 'Manager'
                      }
                      return (
                        <StyledTableRow key={staffMember.username}>
                          <StyledTableCell>
                            <IconButton
                              onClick={() => loadFormOnAction(staffMember)}
                            >
                              <Avatar className={classes.avatar}>
                                <AccountCircleIcon />
                              </Avatar>
                            </IconButton>
                          </StyledTableCell>
                          <StyledTableCell>{staffMember.firstName}</StyledTableCell>
                          <StyledTableCell>{staffMember.lastName}</StyledTableCell>
                          <StyledTableCell>{position}</StyledTableCell>
                          <StyledTableCell>{staffMember.email}</StyledTableCell>
                          <StyledTableCell>{staffMember.username}</StyledTableCell>
                        </StyledTableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </main>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  auth: state.authState,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
  staff: state.staffState.staff,
  formOpen: state.formState.open,
  formData: state.formState.data,
  formType: state.formState.list,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),

  initialStaffLoad: () => dispatch(getAllStaff()),
  addEmployee: (newStaff) => dispatch(createNewStaff(newStaff)),
  updateEmployee: (updatedStaff) => dispatch(updateStaff(updatedStaff)),
  deleteEmployee: (username) => dispatch(deleteStaff(username)),

  loadForm: (staff) => dispatch(loadFormWithStaffData(staff)),
  loadFormNewStaff: () => dispatch(loadFormForNewStaff()),
  closeForm: () => dispatch(loadFormFail()),

  snackBarSucceed: (msg) => dispatch(snackBarSuccess(msg)),
  snackBarFailed: (msg) => dispatch(snackBarFail(msg)),
  closeSnackBar: () => dispatch(snackBarClose()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Staff);

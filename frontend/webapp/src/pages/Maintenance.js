/**
 * Module Dependencies
 */
import React from 'react';
import moment from 'moment';

// MaterialUI Components
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

// MaterialUI Icons
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

// Formik and Material-Table
import { Formik, Form, Field } from 'formik';
import MaterialTable from 'material-table';
import { Select, TextField } from 'formik-material-ui';

// Redux
import { connect } from 'react-redux';

import { logoutStaff } from '../redux/thunks/authThunks';

import {
  snackBarFail,
  snackBarSuccess,
  snackBarClose,
} from '../redux/actions/actions';

import {
  addMaintenanceLog,
  searchMaintenanceLog,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
} from '../redux/thunks/reportThunks';

// Components
import FullPageLoader from '../components/FullPageLoader';
import NavBar from '../components/NavBar';

const useRowStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
}));

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
}));

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Row(props) {
  const { row } = props;
  const { data } = props;
  const { field } = props;
  const { maintenanceName } = props;
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const classes = useRowStyles();

  const column = [
    { title: 'Date', field: 'date', type: 'date', initialValue: new Date() },
    {
      title: 'Completed',
      field: 'completed',
      type: 'boolean',
      initialValue: false,
    },
    { title: 'Notes', field: 'description', type: 'string', initialValue: '' },
    { title: 'Cost', field: 'cost', type: 'numeric', initialValue: '0' },
  ];

  const updateEntry = (updatedData) => {
    props.update(maintenanceName, field, updatedData);
  };

  const addEntry = (newData) => {
    props.add(maintenanceName, field, newData);
  };

  const deleteEntry = (ID) => {
    props.delete(maintenanceName, field, ID);
  };

  return (
    <>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.room}
        </TableCell>
        <TableCell align="right">{row.entries}</TableCell>
        <TableCell align="right">{row.uncompleted}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <MaterialTable
                title="History"
                columns={column}
                data={data}
                options={{
                  search: false,
                  paging: false,
                  headerStyle: {
                    fontWeight: 'bold',
                  },
                  rowStyle: (rowData) => ({
                    backgroundColor:
                      selectedRow === rowData.tableData.id ? '#EEE' : '#FFF',
                  }),
                }}
                components={{
                  Container: (containerProps) => (
                    <Paper {...containerProps} elevation={0} />
                  ),
                }}
                editable={{
                  onRowUpdate: (newData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        // Error Validation
                        if (newData.description.trim().length > 100) {
                          reject();
                          // eslint-disable-next-line no-undef
                          alert('Description is Too Long');
                          return;
                        }

                        if (newData.cost < 0) {
                          reject();
                          // eslint-disable-next-line no-undef
                          alert('Not a valid Cost');
                          return;
                        }

                        updateEntry(newData);
                        resolve();
                      }, 100);
                    }),
                  onRowAdd: (newData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        // Error Validation
                        if (!newData.description) {
                          reject();
                          // eslint-disable-next-line no-undef
                          alert('Description Cannot be Blank');
                          return;
                        }

                        // Setting Initial Values
                        const submitData = newData;
                        if (!newData.date) {
                          submitData.date = moment().format('YYYY-MM-DD');
                        }
                        if (!newData.completed) submitData.completed = false;
                        if (!newData.cost) submitData.cost = 0;

                        addEntry(submitData);
                        resolve();
                      }, 100);
                    }),
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        deleteEntry(oldData._id);
                        resolve();
                      }, 100);
                    }),
                }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function Maintenance({
  auth,
  maintenanceName,
  maintenanceChoices,
  maintenanceLog,
  loading,
  snackBar,
  logout,
  createNewMaintenanceLog,
  searchForMaintenanceLog,
  addLog,
  updateLog,
  deleteLog,
  closeSnackBar,
}) {
  const classes = useStyles();
  const [actionType, setActionType] = React.useState(null);

  const submitFormAction = (formType, submitHandler) => {
    if (formType === 'add') {
      setActionType('add');
    } else if (formType === 'search') {
      setActionType('search');
    }
    submitHandler();
  };

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
          <Grid
            container
            direction="row"
            justify="space-evenly"
            alignItems="flex-start"
          >
            <Grid item xs={8}>
              <Typography component="h4">
                <Box textAlign="center" fontWeight="fontWeightBold" m={1}>
                  {`Maintenance: ${maintenanceName}`}
                </Box>
              </Typography>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Room</TableCell>
                      <TableCell align="right">Entries</TableCell>
                      <TableCell align="right">Uncompleted</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(maintenanceLog).map(([key, value]) => {
                      let notCompleted = 0;
                      if (value) {
                        value.forEach((log) => {
                          if (!log.completed) notCompleted++;
                        });
                      }
                      return (
                        <Row
                          key={key}
                          field={key}
                          maintenanceName={maintenanceName}
                          add={addLog}
                          update={updateLog}
                          delete={deleteLog}
                          data={value}
                          row={{
                            room: key,
                            entries: value ? value.length : 0,
                            uncompleted: notCompleted,
                          }}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={3}>
              <Paper
                variant="outlined"
                elevation={3}
                className={classes.actions}
              >
                <Formik
                  initialValues={{
                    maintenanceSearch:
                      maintenanceChoices.length !== 0
                        ? maintenanceChoices[0]._id
                        : 0,
                    createMaintenance: '',
                  }}
                  validate={(values) => {
                    const errors = {};

                    if (values.createMaintenance.trim().length !== 0) {
                      if (values.createMaintenance.trim().length > 20) {
                        errors.createMaintenance = 'Name is Too Long';
                      }
                    }

                    return errors;
                  }}
                  onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true);

                    if (actionType === 'add') {
                      // Add New Maintenance Log
                      createNewMaintenanceLog(values.createMaintenance);
                    } else if (actionType === 'search') {
                      // Search Maintenance Log
                      searchForMaintenanceLog(values.maintenanceSearch);
                    }

                    setSubmitting(false);
                  }}
                >
                  {({ submitForm }) => (
                    <Form>
                      <Grid
                        container
                        justify="space-evenly"
                        alignItems="center"
                      >
                        <Grid item xs={7} className={classes.actions}>
                          <Field
                            fullWidth
                            component={Select}
                            variant="outlined"
                            name="maintenanceSearch"
                          >
                            {maintenanceChoices.map((choice) => (
                              <MenuItem key={choice._id} value={choice._id}>
                                {choice.Name}
                              </MenuItem>
                            ))}
                          </Field>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              submitFormAction('search', submitForm)
                            }
                          >
                            Search
                          </Button>
                        </Grid>
                        <Grid item xs={7} className={classes.actions}>
                          <Field
                            fullWidth
                            component={TextField}
                            variant="outlined"
                            name="createMaintenance"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            onClick={() => submitFormAction('add', submitForm)}
                          >
                            Add
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Grid>
          </Grid>
        </main>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  auth: state.authState,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
  maintenanceName: state.maintenanceState.logName,
  maintenanceChoices: state.maintenanceState.logSearchNames,
  maintenanceLog: state.maintenanceState.MaintenanceLog,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),
  createNewMaintenanceLog: (name) => dispatch(addMaintenanceLog(name)),
  searchForMaintenanceLog: (id) => dispatch(searchMaintenanceLog(id)),

  addLog: (name, field, newEntry) =>
    dispatch(addLogEntry(name, field, newEntry)),
  updateLog: (name, field, updatedEntry) =>
    dispatch(updateLogEntry(name, field, updatedEntry)),
  deleteLog: (name, field, ID) => dispatch(deleteLogEntry(name, field, ID)),

  snackBarSucceed: (msg) => dispatch(snackBarSuccess(msg)),
  snackBarFailed: (msg) => dispatch(snackBarFail(msg)),
  closeSnackBar: () => dispatch(snackBarClose()),
});
export default connect(mapStateToProps, mapDispatchToProps)(Maintenance);

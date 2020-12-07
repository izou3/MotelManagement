/**
 * Module Dependencies
 */
import React from 'react';
import Moment from 'react-moment';
import moment from 'moment';


// MaterialUI Components
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import { Paper } from '@material-ui/core';

// MaterialUI Icons
import PageviewIcon from '@material-ui/icons/Pageview';
import IconButton from '@material-ui/core/IconButton';

// Styled Componets for Table
import { StyledTableCell, StyledTableRow } from './StyledTable';

const useStyles = makeStyles((theme) => ({
  table: {
    width: '100%',
    marginTop: '1em',
    marginBottom: '0.5em',
  },
  tableHeader: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  infoTable: {
    width: '100%',
    marginTop: '1em',
    marginBottom: '0.5em',
  },
}));

/**
 * Stateless Component that Renders Table of Given Data
 * @param {Array} props.resList Array of Data to be Rendered
 */
export default function RegTable(props) {
  const classes = useStyles();

  const { resList, roomList } = props;

  const handleOpen = (room, checked, BookingID) =>
    props.handleOpen(room, checked, BookingID);

  return (
    <TableContainer component={Paper} className={classes.table}>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell />
            <StyledTableCell>Room</StyledTableCell>
            <StyledTableCell>Check-In</StyledTableCell>
            <StyledTableCell>Check-Out</StyledTableCell>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell>Price Paid</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {resList.map((res, index) => (
            <StyledTableRow key={res.RoomID}>
              <StyledTableCell>
                <IconButton
                  onClick={() =>
                    handleOpen(res.RoomID, res.Checked, res.BookingID)
                  }
                >
                  <PageviewIcon />
                </IconButton>
              </StyledTableCell>
              <StyledTableCell>{ roomList ? roomList[index] : null }</StyledTableCell>
              <StyledTableCell>
                {res.checkIn ? (
                  <Moment
                    date={moment(res.checkIn).format('YYYY-MM-DD')}
                    parse="YYYY-MM-DD"
                    format="MMM D YYYY"
                  />
                ) : (
                  ''
                )}
              </StyledTableCell>
              <StyledTableCell>
                {res.checkOut ? (
                  <Moment
                    date={moment(res.checkOut).format('YYYY-MM-DD')}
                    parse="YYYY-MM-DD"
                    format="MMM D YYYY"
                  />
                ) : (
                  ''
                )}
              </StyledTableCell>
              <StyledTableCell>
                {res.firstName ? res.firstName : ''}
              </StyledTableCell>
              <StyledTableCell>
                {res.pricePaid ? res.pricePaid : ''}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

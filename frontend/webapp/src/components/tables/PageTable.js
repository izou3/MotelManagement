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
import TablePagination from '@material-ui/core/TablePagination';

// MaterialUI Icons
import IconButton from '@material-ui/core/IconButton';
import PageviewIcon from '@material-ui/icons/Pageview';

// Components
import { StyledTableCell, StyledTableRow } from './StyledTable';

const useStyles = makeStyles((theme) => ({
  table: {
    width: '95%',
    marginTop: '1em',
    marginBottom: '0.5em',
  },
  tableHeader: {
    backgroundColor: theme.palette.secondary,
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
 * Stateless Component that Renders Table with Pages that has maximum of 3 rooms per page
 * @param {Array} props.resList The List of Data to be Rendered by the Table
 */
export default function PageTable(props) {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 3;
  // const [rowsPerPage, setRowsPerPage] = React.useState(1);

  const { resList } = props;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpen = (room, checked, id) => props.handleOpen(room, checked, id);

  return (
    <>
      <TableContainer className={classes.infoTable}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell />
              <StyledTableCell>Check-In</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Total</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {resList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((res) => (
                <StyledTableRow key={res.BookingID}>
                  <StyledTableCell>
                    <IconButton
                      onClick={() =>
                        handleOpen(res.RoomID, res.Checked, res.BookingID)
                      }
                    >
                      <PageviewIcon />
                    </IconButton>
                  </StyledTableCell>
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
      <TablePagination
        rowsPerPageOptions={[3]}
        component="div"
        count={resList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
      />
    </>
  );
}

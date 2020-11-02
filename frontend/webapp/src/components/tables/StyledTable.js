import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

export const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    padding: theme.spacing(2, 2, 2, 0),
  },
  body: {
    fontSize: 14,
    padding: theme.spacing(0, 0, 0),
  },
}))(TableCell);

export const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: 'rgba(63,80,181, 0.2)'
    }
  },
}))(TableRow);

import React from 'react'; 
import { Button } from '@material-ui/core'; 
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function BookingModule(props) {

    const handleClose = () => {
        props.handleClose(); 
    };

    return(
        <Dialog
            open={props.open}
            onClose={handleClose}
        >
            <DialogTitle>{"Call Us For the Best Rates and Deals"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                Call (605) 348-3200 for Your Reservation Today
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                Close
                </Button>
            </DialogActions>
        </Dialog>
    ); 
}

export default BookingModule; 
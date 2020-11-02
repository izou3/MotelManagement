import React from 'react';
import { Route } from 'react-router-dom';
import FilterHdrTwoToneIcon from "@material-ui/icons/FilterHdrTwoTone";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core"; 
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
    error: {
        textAlign: 'center', 
        padding: theme.spacing(6, 10, 6), 
        backgroundColor: theme.palette.common.white, 
        color: theme.palette.common.black
    }
})); 

function Error() {
    const classes = useStyles(); 

    return (
        <Route
        render={({ staticContext }) => {
            if (staticContext) staticContext.statusCode = 404;
            return (
                <React.Fragment>
                    <Grid className={classes.error}>
                        <IconButton color="inherit" onClick={() => window.location.href='/'}>
                            <FilterHdrTwoToneIcon style={{margin: 0, fontSize: '12rem'}}/>
                        </IconButton>
                        <Typography vriant='h1'>
                            404 | Opps! Not the 100 Mile View You Were Looking For
                        </Typography>
                    </Grid>
                </React.Fragment>
            );
        }}
        />
    );
}

export default Error;
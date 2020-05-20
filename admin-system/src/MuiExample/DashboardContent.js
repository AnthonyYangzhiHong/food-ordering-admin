import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Deposits from './Deposits';
import Orders from './Orders';

class DashboardContent extends Component {
    render() {
        return (
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper>
                        <Deposits />
                        </Paper>
                    </Grid>
                    {/* Recent Orders */}
                    <Grid item xs={12}>
                        <Paper>
                        <Orders />
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default DashboardContent


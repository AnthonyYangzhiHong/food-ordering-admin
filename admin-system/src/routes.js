import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Dashboard from './MuiExample/Dashboard'
import Orders from './MuiExample/Orders'
import ComponentTest from './MuiExample/ComponentTest'

export const Routes = () => {
    return (
        <div>
            <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/home" component={Dashboard} />
                <Route exact path="/orders" component={Orders} />
                <Route exact path="/component-test" component={ComponentTest} />
            </Switch>
        </div>
    )
}
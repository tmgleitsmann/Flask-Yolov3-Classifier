import React from 'react';
import {BrowserRouter, Route, Switch, Link, NavLink} from 'react-router-dom';
import Homepage from '../components/Homepage';
import Upload from '../components/Upload';
import Runs from '../components/Runs';

const AppRouter = () => {
    return(
        <div>
            <BrowserRouter>
                <Switch>
                    <Route path = "/" component={Homepage} exact={true}/>
                    <Route path = "/Upload" component={Upload} exact={true}/>
                    <Route path = "/Runs" component={Runs} exact={true}/>
                </Switch>
            </BrowserRouter>
        </div>
    );
};

export default AppRouter;
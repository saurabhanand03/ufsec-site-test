import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Workshops from './pages/Workshops';
import WorkshopDetail from './components/WorkshopDetail';
import ExecBoard from './pages/ExecBoard';
import DevTeam from './pages/DevTeam';
import Tabs from './components/Tabs';

const App = () => {
    return (
        <Router>
            <Tabs />
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/workshops" component={Workshops} />
                <Route path="/workshops/:id" component={WorkshopDetail} />
                <Route path="/exec-board" component={ExecBoard} />
                <Route path="/dev-team" component={DevTeam} />
            </Switch>
        </Router>
    );
};

export default App;
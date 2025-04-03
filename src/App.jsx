import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Workshops from './pages/Workshops';
import WorkshopDetail from './components/WorkshopDetail';
import UploadWorkshop from './components/UploadWorkshop';
import ExecBoard from './pages/ExecBoard';
import DevTeam from './pages/DevTeam';
import Tabs from './components/Tabs';

const App = () => {
    return (
        <Router>
            <Tabs />
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route path="/workshops/:id" component={WorkshopDetail} />
                <Route path="/upload" component={UploadWorkshop} />
                <Route exact path="/workshops" component={Workshops} />
                <Route path="/exec-board" component={ExecBoard} />
                <Route path="/dev-team" component={DevTeam} />
            </Switch>
        </Router>
    );
};

export default App;